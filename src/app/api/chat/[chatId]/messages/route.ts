import { db } from "@/lib/db";
import { chat, message } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const runtime =
  process.env.NODE_ENV === "production" ? "edge" : undefined;

export async function GET(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const chatId = parseInt(params.chatId);

    const selectedChat = (
      await db
        .select()
        .from(chat)
        .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
    )[0];

    if (!selectedChat) return new NextResponse("Unauthorized", { status: 401 });

    return NextResponse.json(
      await db.select().from(message).where(eq(message.chatId, chatId))
    );
  } catch (err) {
    console.log(err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
