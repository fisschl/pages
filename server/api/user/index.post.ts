import { hashPassword } from "~/server/utils/password";
import { UserInsertSchema } from "~/server/utils/schema";
import { redis } from "~/server/utils/redis";
import { db, sanitize } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  if (!redis.isOpen) await redis.connect();
  const body = await readValidatedBody(event, UserInsertSchema.parse);
  body.name = sanitize(body.name);
  const user = await checkUserSafe(event);
  if (!user || user.role !== "admin") {
    body.role = undefined;
  }
  body.role = undefined;
  const password = await hashPassword(body.password);
  if (!password) throw createError({ status: 400 });
  body.password = password;
  await db.insert(users).values(body);
  return { message: "注册成功" };
});
