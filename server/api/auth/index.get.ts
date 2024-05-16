import { throttle } from "lodash-es";
import { database } from "~/server/database/postgres";
import { writeCache } from "~/server/database/redis";
import { useUser } from "~/server/utils/user";

const update_last_login = throttle(async (user_id: string) => {
  const res = await database.user.update({
    where: { id: user_id },
    data: { last_login: new Date() },
  });
  await writeCache(res.id, res);
}, 1000);

export default defineEventHandler(async (event) => {
  const user = await useUser(event);
  if (!user) return { message: "未登录" };
  update_last_login(user.id);
  return user;
});
