import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const id = () => typeid().toString();

/**
 * 用户
 */
export const users = pgTable("users", {
  id: varchar("id").primaryKey().$default(id),
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
  name: varchar("name").unique().notNull(),
  password: varchar("password").notNull(),
  avatar_id: varchar("avatar_id"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  avatar: one(pictures, {
    fields: [users.avatar_id],
    references: [pictures.id],
  }),
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
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
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
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
  name: varchar("name").notNull(),
  content_type: varchar("content_type").notNull(),
  user_id: varchar("user_id").notNull(),
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
