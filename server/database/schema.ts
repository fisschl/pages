import { base58 } from "@scure/base";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";

const dateTime = (name: string) => {
  return timestamp(name, { withTimezone: true, mode: "string" }).defaultNow();
};

export const $id = () => {
  const bytes = typeid().toUUIDBytes();
  return base58.encode(bytes);
};

/**
 * 用户
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().$default($id),
  update_at: dateTime("update_at").notNull(),
  name: varchar("name").unique().notNull(),
  password: varchar("password").notNull(),
  avatar: varchar("avatar"),
  role: varchar("role"),
});

export const users_relations = relations(users, ({ many }) => ({
  ai_chats: many(ai_chats),
}));

/**
 * AI 对话
 */
export const ai_chats = pgTable(
  "ai_chats",
  {
    id: varchar("id").primaryKey().$default($id),
    update_at: dateTime("update_at").notNull(),
    user_id: varchar("user_id")
      .notNull()
      .references(() => users.id),
    role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
  },
  ({ user_id, update_at }) => ({
    user_id_idx: index().on(user_id),
    update_at_idx: index().on(update_at),
  }),
);

export const ai_chats_relations = relations(ai_chats, ({ one, many }) => ({
  user: one(users, {
    fields: [ai_chats.user_id],
    references: [users.id],
  }),
  files: many(chat_files),
}));

export const chat_files = pgTable("chat_files", {
  id: varchar("id").primaryKey().$default($id),
  chat_id: varchar("chat_id").references(() => ai_chats.id),
  key: varchar("key"),
});

export const chat_files_relations = relations(chat_files, ({ one }) => ({
  chat: one(ai_chats, {
    fields: [chat_files.chat_id],
    references: [ai_chats.id],
  }),
}));
