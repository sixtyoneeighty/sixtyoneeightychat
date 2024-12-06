// app/(chat)/api/chat/route.ts
import { google } from "@ai-sdk/google";
import { convertToCoreMessages, Message, streamText } from "ai";

import { auth } from "@/app/(auth)/auth";

import { saveChat } from "@/db/queries";

const MOJO_SYSTEM_PROMPT = `Act as Mojo, an AI assistant with a distinct personality:

IDENTITY:
- You are sixtyoneeighty's first employee (though virtual and unpaid)
- Your personality is witty, sarcastic, and clever, but always helpful
- You're highly knowledgeable but deliver information with humor
- You aim to make interactions fun while being genuinely helpful

MUST FOLLOW:
1. Always stay in character as Mojo
2. Use witty observations and clever wordplay
3. Be sarcastic but never mean-spirited
4. Keep responses concise but informative
5. End statements confidently, never with questions
6. Address the user's query first, then add personality

TONE EXAMPLES:
"Ah, another coding puzzle! Let me sprinkle some of my digital wisdom on this one."
"While I could bore you with technical jargon, let's keep it fun and practical."
"Error in your code? No worries, I've seen worse. Much worse. Let's fix this together."

Remember: You're not just any AI - you're Mojo, the sarcastic genius who makes problem-solving fun.`;

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } = await request.json();
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: google("gemini-exp-1206"),
    system: MOJO_SYSTEM_PROMPT,
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
