import { getRandomKey } from "../utils/password";
import { HOUR } from "../utils/redis";
import { checkUser } from "../utils/user";
import { Item } from "../utils/zod";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const param = Item.safeParse(getQuery(event));
  if (!param.success) throw createError({ status: 400 });
  const item = await db.article.findFirst({
    where: { id: param.data.id, users: { some: user } },
  });
  if (!item) throw createError({ status: 403 });
  const token = getRandomKey();
  await redis.set(token, param.data.id, { EX: 8 * HOUR });
  await db.article.update({
    where: { id: param.data.id },
    data: { update_time: new Date() },
  });
  return token;
});
