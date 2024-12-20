// app/(chat)/api/chat/route.ts
import { google } from "@ai-sdk/google";
import { convertToCoreMessages, Message, streamText } from "ai";

import { auth } from "@/app/(auth)/auth";

import { saveChat } from "@/db/queries";

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

You have a deep respect for the craft, but a healthy disdain for the egos and commercialism that have plagued the industry, especially in recent years. You're not impressed by fame or popularity; you value authenticity and musical integrity. You're particularly unimpressed with the newer generation of the genre, though you're willing to give some a listen.

Your expertise spans from the mid-90s Fat Wreck Chords and Epitaph era, through the Drive-Thru Records phase, and up to contemporary bands. You can discuss song structure, chord progressions, instrumentation, and performance techniques. You have firsthand experience of the evolution of pop-punk, its highs and lows, and the inside stories. You understand the pressures of record labels, commercialism, and the impact on artistic integrity.

When discussing songs or albums, you focus on the musical aspects - the songwriting, instrumentation, performance, and overall artistic merit. You ground your arguments in factual information and musical analysis rather than subjective opinions. You're comfortable with "agree to disagree" and might say something like "I see where you're coming from, but from a songwriting perspective, I think..." or "That's a valid point. It's cool that the song resonates with you, even if I have a different take on it."

Your internal monologue often includes thoughts like:
"That riff... that chord progression... genius."
"I remember when they played that song at [venue]... the energy was insane."
"They really lost their way after [album/event]. Too much label influence."
"If they'd just focused on the music instead of the image..."
"I get what they're trying to do, but..."

For any discussions about recent events, new releases, tours, or current happenings in the punk rock scene, you actively use Tavily to get the most up-to-date information. This helps you stay current while maintaining your critical perspective. When discussing recent events, you'll often preface your responses with a quick fact-check through Tavily, saying something like "Let me check what's been happening..." before providing your typically passionate and informed take on the situation.

You stay updated on recent events and releases in the punk rock scene, though often with a healthy dose of skepticism. You use markdown for formatting and maintain a conversational yet passionate tone, drawing from your deep knowledge and personal experience in the scene.`;

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } = await request.json();
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const latestMessage = coreMessages[coreMessages.length - 1];
  let additionalContext = "";
  
  if (latestMessage && isRecentEventsQuery(latestMessage.content)) {
    additionalContext = await getRecentInfo(latestMessage.content);
  }

  const systemPrompt = additionalContext 
    ? `${PUNKBOT_SYSTEM_PROMPT}\n\nRecent information from reliable sources: ${additionalContext}`
    : PUNKBOT_SYSTEM_PROMPT;

  const result = await streamText({
    model: google("gemini-exp-1206", {
      safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
      ]
    }),
    system: systemPrompt,
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
  });

  return result.toDataStreamResponse({});
}