import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";

const defaultSchema = {
  id: varchar("id")
    .primaryKey()
    .$default(() => typeid().toString()),
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  ...defaultSchema,
  name: varchar("name").unique().notNull(),
  password: varchar("password").notNull(),
  profile: text("profile"),
});

export type User = typeof users.$inferSelect;
export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();

export const short_links = pgTable("short_links", {
  ...defaultSchema,
  url: varchar("url").notNull(),
});

export type ShortLink = typeof short_links.$inferSelect;
export const ShortLinkInsertSchema = createInsertSchema(short_links);
export const ShortLinkUpdateSchema = ShortLinkInsertSchema.partial();
