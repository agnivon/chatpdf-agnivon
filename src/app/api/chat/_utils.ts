import { db } from "@/lib/db";
import { chatMessage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function onStart(query: string, regenerate: boolean, chatId: string) {
  return () => {
    if (!regenerate) {
      db.insert(chatMessage)
        .values({
          chatId,
          content: query,
          role: "user",
        })
        .execute();
    }
  };
}

export function onCompletion(regenerate: boolean, chatId: string) {
  return async (completion: string) => {
    if (regenerate) {
      const result = await db.query.chatMessage.findFirst({
        where: eq(chatMessage.chatId, chatId),
        columns: {
          id: true,
        },
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
      });
      if (result) {
        db.update(chatMessage)
          .set({ content: completion })
          .where(eq(chatMessage.id, result.id))
          .execute();
      }
    } else {
      db.insert(chatMessage)
        .values({
          chatId,
          content: completion,
          role: "assistant",
        })
        .execute();
    }
  };
}
