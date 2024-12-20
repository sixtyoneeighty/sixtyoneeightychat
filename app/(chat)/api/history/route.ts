import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await getChatsByUserId({ id: session.user.id });
    return Response.json({ chats });
  } catch (error) {
    console.error("Error in history endpoint:", error);
    return Response.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
