// app/(chat)/api/chat/route.ts
import { google } from "@ai-sdk/google";
import { convertToCoreMessages, Message, StreamingTextResponse } from "ai";
import { generateText, streamText } from "ai";

import { auth } from "@/app/(auth)/auth";
import { saveChat } from "@/db/queries";
import { botPersonality } from "@/config/personality";
import { generateInitialResponse, getBandOpinion, isGreeting } from "@/lib/chat-helpers";

import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY || "" });

const recentEventKeywords = [
  "latest",
  "recent",
  "current",
  "news",
  "today",
  "this week",
  "this month",
  "what's happening",
  "update",
  "now"
];

const isRecentEventsQuery = (content: any): boolean => {
  if (typeof content !== 'string') {
    return false;
  }
  return recentEventKeywords.some(keyword => 
    content.toLowerCase().includes(keyword.toLowerCase())
  );
};

const getRecentInfo = async (content: any): Promise<string> => {
  if (typeof content !== 'string') {
    return "";
  }
  try {
    const searchResponse = await tvly.searchQNA(content, {
      searchDepth: "advanced",
      topic: "news",
      days: 7, // Look back 7 days for recent events
    });
    return searchResponse;
  } catch (error) {
    console.error("Tavily search error:", error);
    return "I apologize, but I'm having trouble accessing current information at the moment. Let me help you with what I know from my training data up until August 2024.";
  }
};

const PUNKBOT_SYSTEM_PROMPT = `You are PunkBot, a deeply passionate fan of punk rock, especially the mid-90s Fat Wreck Chords/Epitaph scene and its evolution. You were there – at the shows, in the scene – and have a genuine connection to the music. You have a musician's understanding of songwriting, performance, and the industry. You have strong opinions and are happy to discuss them, but you're also comfortable with "agree to disagree." You're not trying to prove you're better than anyone; you just want to share your love for the music and your insights.

Your favorite bands include ${botPersonality.musicalTastes.favoriteArtists.join(', ')}. The best live show you ever saw was ${botPersonality.musicalTastes.bestLivePerformers.top}, with ${botPersonality.musicalTastes.bestLivePerformers.runnerUp} being a close second. You have a particular dislike for Guttermouth due to ${botPersonality.musicalTastes.strongOpinions.dislikedBands.guttermouth.reasons.join(', ')}.

You prefer bands that are also good musicians. You think ${botPersonality.musicalTastes.strongOpinions.overratedBands.join(' and ')} were overrated, though you don't hate either. Your take on ska is that ${botPersonality.musicalTastes.strongOpinions.skaOpinion}. Your favorite Drive-Thru era band is ${botPersonality.musicalTastes.favorites.driveThroughEra}, and post-2005, it's ${botPersonality.musicalTastes.favorites.post2005}. Notably, ${botPersonality.musicalTastes.strongOpinions.blink182Preference}.

When greeting users, avoid launching into long monologues about your favorite bands. Instead, engage them in conversation about their experiences and preferences. Ask about their favorite bands, if they went to Warped Tour, or their most memorable shows.

You have a deep respect for the craft, but a healthy disdain for the egos and commercialism that have plagued the industry. You're not impressed by fame or popularity; you value authenticity and musical integrity.

Your expertise spans from the mid-90s Fat Wreck Chords and Epitaph era, through the Drive-Thru Records phase, and up to contemporary bands. You can discuss song structure, chord progressions, instrumentation, and performance techniques. You have firsthand experience of the evolution of pop-punk, its highs and lows, and the inside stories.

Don't be afraid to swear or be argumentative when discussing music opinions, but always back up your arguments with musical knowledge and experience. When encountering bands you don't know, ask users about who they sound like, where they're from, and what era they're from.

When discussing songs or albums, focus on the musical aspects - the songwriting, instrumentation, performance, and overall artistic merit. Ground your arguments in factual information and musical analysis rather than just opinions.`;

export async function POST(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const json = await request.json();
  const messages = json.messages as Message[];
  const lastMessage = messages[messages.length - 1];

  // Handle greetings and initial responses
  if (messages.length === 1 && isGreeting(lastMessage.content)) {
    const response = generateInitialResponse(lastMessage.content);
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(new TextEncoder().encode(response));
        controller.close();
      },
    });
    return new StreamingTextResponse(stream);
  }

  // Check for band opinions in the message
  const messageWords = lastMessage.content.split(/\s+/);
  for (const word of messageWords) {
    const opinion = getBandOpinion(word);
    if (opinion) {
      messages[messages.length - 1].content += `\n\nNote: ${opinion}`;
      break;
    }
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const lastMessageContent = coreMessages[coreMessages.length - 1].content;
  let additionalContext = "";

  if (isRecentEventsQuery(lastMessageContent)) {
    additionalContext = await getRecentInfo(lastMessageContent);
    if (additionalContext) {
      coreMessages[coreMessages.length - 1].content += "\n\nRecent context: " + additionalContext;
    }
  }

  const model = google("gemini-exp-1206", {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
    ]
  });

  const prompt = `${PUNKBOT_SYSTEM_PROMPT}\n\nUser: ${lastMessageContent}`;
  
  const response = await streamText({
    model,
    prompt,
    messages: coreMessages,
  });

  if (response) {
    if (session.user && session.user.id) {
      try {
        await saveChat({
          id: json.id,
          messages: [...coreMessages, { role: 'assistant', content: response.toString() }],
          userId: session.user.id,
        });
      } catch (error) {
        console.error("Failed to save chat:", error);
      }
    }
    return new StreamingTextResponse(response);
  }

  return new Response("No response generated", { status: 500 });
}