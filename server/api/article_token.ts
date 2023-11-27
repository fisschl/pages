import { getRandomKey } from "../utils/password";
import { HOUR } from "../utils/redis";
import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  const item = await db.article.findFirst({
    where: { id, users: { some: user } },
  });
  if (!item) throw createError({ status: 403 });
  const token = getRandomKey();
  await redis.set(token, id, { EX: 8 * HOUR });
  await db.article.update({
    where: { id },
    data: { update_time: new Date() },
  });
  return token;
});
