import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

import { $id } from "~/utils/token";

const dateTime = (name: string) => {
  return timestamp(name, { mode: "string" }).defaultNow();
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
