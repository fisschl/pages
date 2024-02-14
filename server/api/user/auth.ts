import { addDays } from "date-fns";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { typeid } from "typeid-js";
import { checkUser, verifyPassword } from "~/server/utils/password";
import { DAY, redis } from "~/server/utils/redis";
import { UserInsertSchema } from "~/server/utils/schema";
import { db } from "~/server/utils/db";

const BodySchema = UserInsertSchema.pick({ name: true, password: true });

export default defineEventHandler(async (event) => {
  if (!redis.isOpen) await redis.connect();
  if (event.method === "GET") {
    const user = await checkUser(event);
    user.password = "******";
    return user;
  }
  const body = await readValidatedBody(event, BodySchema.parse);
  const user = await db.query.users.findFirst({
    where: eq(users.name, body.name),
  });
  if (!user) throw createError({ status: 401 });
  const ok = await verifyPassword(body.password, user.password);
  if (!ok) throw createError({ status: 401 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  const token = typeid().toString() + nanoid(24);
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.set(token, user.id);
  await redis.expireAt(token, expires);
  user.password = "******";
  return user;
});
