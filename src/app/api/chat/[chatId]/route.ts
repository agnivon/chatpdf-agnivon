import { db } from "@/lib/db";
import { chat, chatDocument } from "@/lib/db/schema";
import { deleteAllNamespaceVectors } from "@/lib/pinecone/edge";
import { deleteS3Files } from "@/lib/s3";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

//export const runtime = "edge";

export async function GET(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();

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

    return NextResponse.json(selectedChat);
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();

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

    const documentFileKeys = (
      await db
        .select({
          fileKey: chatDocument.fileKey,
        })
        .from(chatDocument)
        .where(eq(chatDocument.chatId, chatId))
    ).map(({ fileKey }) => fileKey);

    await db.delete(chat).where(eq(chat.id, chatId));

    console.log(`Deleted chat: ${chatId}`);

    deleteAllNamespaceVectors(process.env.PINECONE_INDEX!, chatId.toString());

    deleteS3Files(documentFileKeys);

    return new NextResponse("");
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
