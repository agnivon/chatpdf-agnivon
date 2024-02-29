"use client";
import { chat, chatDocument, message } from "@/lib/db/schema";

export type S3FileUploadResponse = {
  fileKey: string;
  fileName: string;
  fileType: string;
};

export type CreateChatResponse = {
  chatId: number;
};

export type ChatsResponse = {
  chats: Chat[];
  chatDocuments: ChatDocument[];
};

export type ChatMessageResponse = ChatMessage[];

export type Chat = typeof chat.$inferSelect;

export type ChatDocument = typeof chatDocument.$inferSelect;

export type ChatMessage = typeof message.$inferSelect;
