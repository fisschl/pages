import { database } from "~/server/database/postgres";
import { useToken } from "~/server/utils/user";
import { redis } from "~/server/database/redis";
import { writeLog } from "~/server/database/clickhouse";

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  const id = await redis.hget(token, "user");
  if (!id) return { token, user: null };
  const user = await database.user.update({
    where: { id },
    data: { last_login: new Date() },
  });
  await writeLog("用户访问", JSON.stringify(user));
  return { token, user };
});
