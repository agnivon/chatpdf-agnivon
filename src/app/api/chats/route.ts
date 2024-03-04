import { db } from "@/lib/db";
import { chat, chatDocument } from "@/lib/db/schema";
import { ChatDocument } from "@/types";
import { auth } from "@clerk/nextjs";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

async function fetchChats(userId: string) {
  return db.select().from(chat).where(eq(chat.userId, userId));
}

async function fetchDocuments(chatIds: string[]) {
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

  const chatDocuments = (await fetchDocuments(chatIds)).reduce(
    (map, document) => {
      if (document.chatId in map) {
        map[document.chatId].push(document);
      } else {
        map[document.chatId] = [document];
      }
      return map;
    },
    {} as Record<string, ChatDocument[]>
  );

  return NextResponse.json({ chats, chatDocuments });
}
