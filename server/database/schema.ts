import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";

const $id = () => typeid().toString();

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

/**
 * 图片
 */
export const pictures = pgTable("pictures", {
  id: varchar("id").primaryKey(),
  update_at: dateTime("update_at").notNull(),
  name: varchar("name").notNull(),
  content_type: varchar("content_type").notNull(),
  user_id: varchar("user_id")
    .notNull()
    .references(() => users.id),
});

export type Picture = typeof pictures.$inferSelect;
export const PictureInsertSchema = createInsertSchema(pictures);
export const PictureUpdateSchema = PictureInsertSchema.partial();
