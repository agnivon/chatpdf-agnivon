"use client";
import { chat, chatDocument, chatMessage } from "@/lib/db/schema";

export type S3FileUploadResponse = {
  fileKey: string;
  fileName: string;
  fileType: string;
};

export type CreateChatResponse = {
  chatId: string;
};

export type ChatsResponse = {
  chats: Chat[];
  chatDocuments: Record<string, ChatDocument[] | undefined>;
};

export type ChatMessageResponse = ChatMessage[];

export type Chat = typeof chat.$inferSelect;

export type ChatDocument = typeof chatDocument.$inferSelect;

export type ChatMessage = typeof chatMessage.$inferSelect;
