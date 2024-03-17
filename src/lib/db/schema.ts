import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const ChatStatusEnum = pgEnum("chat_status_enum", [
  "initializing",
  "live",
  "failed",
]);
export const UserSystemEnum = pgEnum("user_system_enum", [
  "system",
  "user",
  "assistant",
]);

export const chat = pgTable("chats", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  status: ChatStatusEnum("status").notNull().default("live"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatDocument = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  fileKey: text("file_key").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessage = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: UserSystemEnum("role").notNull().default("system"),
});

export const drizzleSchemas = {
  chat,
  chatDocument,
  chatMessage,
};
