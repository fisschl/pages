import { eq } from "drizzle-orm";
import { verifyPassword } from "~/server/utils/password";
import { DAY, redis } from "~/server/database/redis";
import { UserInsertSchema, users } from "~/server/database/schema";
import { database } from "~/server/database/postgres";
import { tokenFromContext } from "~/server/api/session";

/**
 * 登录
 */
export default defineEventHandler(async (event) => {
  const token = tokenFromContext(event);
  if (!token) throw createError({ status: 400 });
  const body = await readValidatedBody(event, BodySchema.parse);
  const user = await database.query.users.findFirst({
    where: eq(users.name, body.name),
  });
  if (!user) throw createError({ status: 401 });
  const ok = await verifyPassword(body.password, user.password);
  if (!ok) throw createError({ status: 401 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  await redis.hSet(token, "user", user.id);
  await redis.expire(token, 30 * DAY);
  user.password = "******";
  return user;
});

const BodySchema = UserInsertSchema.pick({ name: true, password: true });
