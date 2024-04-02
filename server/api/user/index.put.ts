import { eq } from "drizzle-orm";
import { extname } from "pathe";
import { database } from "~/server/database/postgres";
import { redis } from "~/server/database/redis";
import { $id, UserUpdateSchema, users } from "~/server/database/schema";
import { hashPassword } from "~/server/utils/password";
import { sanitize } from "~/server/utils/purify";
import { checkUser } from "../auth/index.post";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const body = await readValidatedBody(event, UserUpdateSchema.parse);
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
  // 用户头像应重命名
  if (body.avatar) {
    const avatar = $id() + extname(body.avatar);
    body.avatar = avatar;
  } else {
    body.avatar = undefined;
  }
  body.role = undefined;
  const [item] = await database
    .update(users)
    .set(body)
    .where(eq(users.id, user.id))
    .returning();
  if (!item) throw createError({ status: 400 });
  await redis.del(item.id);
  item.password = "******";
  return item;
});
