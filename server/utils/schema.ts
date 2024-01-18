import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .$default(() => typeid().toString()),
  name: varchar("name").unique().notNull(),
  password: varchar("password").notNull(),
  profile: text("profile"),
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();
