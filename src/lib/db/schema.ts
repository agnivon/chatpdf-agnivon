import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const ChatStatusEnum = pgEnum("chat_status_enum", [
  "initializing",
  "live",
  "failed",
]);
export const UserSystemEnum = pgEnum("user_system_enum", ["system", "user"]);

export const chat = pgTable("chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  status: ChatStatusEnum("status").notNull().default("live"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatDocument = pgTable("documents", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  fileKey: text("file_key").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const message = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: UserSystemEnum("role").notNull().default("system"),
});
