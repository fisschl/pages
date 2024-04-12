import { database } from "~/server/database/postgres";
import { redis } from "~/server/database/redis";
import { sanitize } from "~/server/utils/purify";
import { checkUser } from "../auth/index.post";
import { hashPassword } from "./index.post";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const body = await readBody(event);
  // 密码应被散列
  if (body.password) {
    body.password = await hashPassword(body.password);
  } else {
    body.password = undefined;
  }
  // 对名称进行反 XSS
  if (body.name) {
    body.name = sanitize(body.name);
  } else {
    body.name = undefined;
  }
  body.role = undefined;
  const item = await database.user.update({
    data: body,
    where: { id: user.id },
  });
  if (!item) throw createError({ status: 400 });
  await redis.del(item.id);
  item.password = "******";
  return item;
});
