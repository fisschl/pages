import { throttle } from "lodash-es";
import { useUser } from "./index.post";
import { database } from "~/server/database/postgres";
import { writeCache } from "~/server/database/redis";

const update_last_login = throttle(async (user_id: string) => {
  const res = await database.user.update({
    where: { id: user_id },
    data: { last_login: new Date() },
  });
  await writeCache(res.id, res);
}, 1000);

export default defineEventHandler(async (event) => {
  const user = await useUser(event);
  if (!user) return;
  update_last_login(user.id);
  return user;
});
