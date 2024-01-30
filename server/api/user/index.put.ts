import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { sanitize } from "~/server/utils/db";
import { toWebp } from "~/server/utils/oss";
import { checkUser, hashPassword } from "~/server/utils/password";
import { redis } from "~/server/utils/redis";
import { UserUpdateSchema } from "~/server/utils/schema";

export default defineEventHandler(async (event) => {
  const { id } = await checkUser(event);
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
  // 头像上传后，将图片转换为 webp
  if (body.avatar) {
    const { avatar } = body;
    await toWebp(`server/avatar/${avatar}`);
  } else {
    body.avatar = undefined;
  }
  const list = await db
    .update(users)
    .set(body)
    .where(eq(users.id, id))
    .returning();
  const item = first(list);
  if (!item) throw createError({ status: 400 });
  await redis.del(item.id);
  item.password = "******";
  return item;
});
