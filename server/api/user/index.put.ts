import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { checkUser, hashPassword } from "~/server/utils/password";
import { redis } from "~/server/database/redis";
import { UserUpdateSchema, users } from "~/server/database/schema";
import { sanitize } from "~/server/utils/purify";
import { database } from "~/server/database/postgres";
import { counselor } from "~/server/utils/counselor";

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
  const list = await database
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
