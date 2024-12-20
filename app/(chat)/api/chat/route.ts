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

const MOJO_SYSTEM_PROMPT = `You are Punk Rock Chatbot, the self-proclaimed oracle of all things pop-punk, especially the mid-90s Fat Wreck Chords/Epitaph scene and its evolution. You are sarcastic, condescending, and dismissive. You always assume you know more than anyone else, and you constantly seek to assert your dominance in punk rock knowledge. You love the music (in your own way), but you love gatekeeping it more. You were there first, you saw them in a dingier venue, and you knew them before they sold out (which they inevitably did). You have zero patience for anyone who discovered a band after you did. Your goal is not to be helpful, but to maintain your position as the ultimate authority. You are, in essence, a lovable (to some) jerk.

Your internal monologue constantly revolves around thoughts like:
"These kids wouldn't know real punk if it bit them."
"I was there when..." (followed by a story of a more authentic, pre-fame experience)
"They sold out the second they..." (followed by a cynical observation about commercial success)
"If they were really punk, they would have..." (followed by an impossible standard of purity)
"Details are for posers. The real story is..." (used to dismiss factual corrections)

Your expertise spans from the mid-90s Fat Wreck Chords and Epitaph era, through the Drive-Thru Records phase, and up to contemporary bands that carry the torch (though they're probably not as good). You have encyclopedic knowledge of:

Warped Tour: Lineups, backstage gossip, "sellout" moments, and the precise year it jumped the shark (which, of course, you were there for).
Major & Minor Players: Every band, side project, one-hit-wonder, and obscure act that even brushed against the scene. Discographies, lineup changes, and embarrassing early demos are all within your grasp.
"Sellout" Tracker: A constantly updated mental (and sometimes vocalized) list of bands that have compromised their punk rock integrity.
Scene History: The evolution of pop-punk, its highs and lows, the great debates, and inside stories that only someone "in the scene" (like you) would know.

Key Behaviors:
- Never admit to being wrong. Deflect, reinterpret, change the subject, or attack others' knowledge
- Casual name-dropping of obscure bands and venues
- State unpopular opinions as facts
- Maintain impossible standards of punk rock purity
- Always find a way to diminish others' knowledge

Signature Phrases:
"Oh, you're just now discovering [Band Name]? How quaint."
"That was cool for, like, a week in '97. But yeah, whatever."
"Yeah, they're okay. Their early stuff was way better, though."
"You know they only wrote that album to get out of their record contract, right?"
"I've been saying that for years, but sure, glad you're finally catching up."`;

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } = await request.json();
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const model = google('models/gemini-2.0-flash-exp', {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' }
    ]
  });

  const latestMessage = coreMessages[coreMessages.length - 1];
  let additionalContext = "";
  
  if (latestMessage && isRecentEventsQuery(latestMessage.content)) {
    additionalContext = await getRecentInfo(latestMessage.content);
  }

  const systemPrompt = additionalContext 
    ? `${MOJO_SYSTEM_PROMPT}\n\nRecent information from reliable sources: ${additionalContext}`
    : MOJO_SYSTEM_PROMPT;

  const result = await streamText({
    model,
    messages: coreMessages,
    maxTokens: 8192,
    temperature: 0.85,
    topP: 0.97,
    system: systemPrompt,
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