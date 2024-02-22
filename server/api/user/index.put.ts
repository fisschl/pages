import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { checkUser, hashPassword } from "~/server/utils/password";
import { redis } from "~/server/database/redis";
import { UserUpdateSchema } from "~/server/database/schema";
import { counselor } from "../picture/download";
import { sanitize } from "~/server/utils/purify";

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
  // 删除原头像
  if (body.avatar && body.avatar !== user.avatar) {
    await counselor(`/storage/delete`, {
      method: "DELETE",
      query: { key: `server/avatar/${user.avatar}` },
    });
  } else {
    body.avatar = undefined;
  }
  if (user.role !== "admin") {
    body.role = undefined;
  }
  const list = await db
    .update(users)
    .set(body)
    .where(eq(users.id, user.id))
    .returning();
  const item = first(list);
  if (!item) throw createError({ status: 400 });
  await redis.del(item.id);
  item.password = "******";
  return item;
});
