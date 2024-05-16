import { database } from "~/server/database/postgres";
import { writeCache } from "~/server/database/redis";
import { hashPassword } from "./index.post";
import { checkUser } from "~/server/utils/user";
import { omit } from "lodash-es";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const body = await readBody<Partial<typeof user>>(event);
  // 密码应被散列
  if (body.password) {
    body.password = await hashPassword(body.password);
  }
  body.role = undefined;
  const item = await database.user.update({
    data: body,
    where: { id: user.id },
  });
  if (!item) throw createError({ status: 400 });
  await writeCache(item.id, item);
  return omit(item, "password");
});
