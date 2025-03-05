import { db } from "@/lib/db";
import { chat, chatMessage } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ chatId: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const chatId = params.chatId;

    const selectedChat = (
      await db
        .select()
        .from(chat)
        .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    )[0];

    if (!selectedChat)
      return new NextResponse("Chat not found", { status: 404 });

    return NextResponse.json(
      await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.chatId, chatId))
        .orderBy(chatMessage.createdAt)
    );
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
