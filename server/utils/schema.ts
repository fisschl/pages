import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { typeid } from "typeid-js";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 256 })
    .primaryKey()
    .$default(() => typeid().toString()),
  name: varchar("name", { length: 256 }).unique().notNull(),
  password: varchar("password", { length: 256 }).notNull(),
  profile: text("profile"),
  update_at: timestamp("update_at", { mode: "string" }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const UserInsertSchema = createInsertSchema(users);
export const UserUpdateSchema = UserInsertSchema.partial();
