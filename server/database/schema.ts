import { base58 } from "@scure/base";
import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

export type User = typeof users.$inferSelect;
export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();

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
      .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    role: varchar("role", { enum: ["user", "assistant"] }).notNull(),
    content: text("content").notNull(),
  },
  ({ user_id,update_at }) => ({
    user_id_idx: index().on(user_id),
    update_at_idx: index().on(update_at),
  }),
);

export const ai_chats_relations = relations(ai_chats, ({ one }) => ({
  user: one(users, {
    fields: [ai_chats.user_id],
    references: [users.id],
  }),
}));

export type AiChart = typeof ai_chats.$inferSelect;
export const AiChartInsertSchema = createInsertSchema(ai_chats);
export const AiChartUpdateSchema = AiChartInsertSchema.partial();

export const ai_billing = pgTable("ai_billing", {
  date: date("date", { mode: "string" }).primaryKey(),
  residual: integer("residual").notNull(),
});

export type AiBilling = typeof ai_billing.$inferInsert;
