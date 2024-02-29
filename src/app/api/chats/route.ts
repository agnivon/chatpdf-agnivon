import { db } from "@/lib/db";
import { chat, chatDocument } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function fetchChats(userId: string) {
  return db.select().from(chat).where(eq(chat.userId, userId));
}

async function fetchDocuments(chatIds: number[]) {
  return chatIds.length
    ? db
        .select()
        .from(chatDocument)
        .where(inArray(chatDocument.chatId, chatIds))
    : [];
}

export async function GET(_request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const chats = await fetchChats(userId);

  const chatIds = chats.map((chat) => chat.id);

  const chatDocuments = await fetchDocuments(chatIds);

  return NextResponse.json({ chats, chatDocuments });
}
