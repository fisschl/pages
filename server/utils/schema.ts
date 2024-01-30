import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

const id = () => typeid().toString();
const dateTime = (name: string) => {
  return timestamp(name, { mode: "string" }).defaultNow();
};

/**
 * 用户
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().$default(id),
  update_at: dateTime("update_at").notNull(),
  name: varchar("name").unique().notNull(),
  password: varchar("password").notNull(),
  avatar: varchar("avatar"),
});

export const usersRelations = relations(users, ({ many }) => ({
  pictures: many(pictures),
}));

export type User = typeof users.$inferSelect;
export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();

/**
 * 短链接
 */
export const short_links = pgTable("short_links", {
  id: varchar("id").primaryKey().$default(id),
  update_at: dateTime("update_at").notNull(),
  url: varchar("url").notNull(),
});

export type ShortLink = typeof short_links.$inferSelect;
export const ShortLinkInsertSchema = createInsertSchema(short_links);
export const ShortLinkUpdateSchema = ShortLinkInsertSchema.partial();

/**
 * 图片
 */
export const pictures = pgTable("pictures", {
  id: varchar("id").primaryKey().$default(id),
  update_at: dateTime("update_at").notNull(),
  name: varchar("name").notNull(),
  content_type: varchar("content_type").notNull(),
  user_id: varchar("user_id")
    .notNull()
    .references(() => users.id),
});

export const picturesRelations = relations(pictures, ({ one }) => ({
  user: one(users, {
    fields: [pictures.user_id],
    references: [users.id],
  }),
}));

export type Picture = typeof pictures.$inferSelect;
export const PictureInsertSchema = createInsertSchema(pictures);
export const PictureUpdateSchema = PictureInsertSchema.partial();
