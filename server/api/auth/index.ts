import { database } from "~/server/database/postgres";
import { useToken } from "~/server/utils/user";
import { readCache, redis, writeCache } from "~/server/database/redis";
import { consola } from "consola";
import type { SerializeObject } from "nitropack";
import type { user as User } from "@prisma/client";

export type UserResponse = SerializeObject<User>;

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  const id = await redis.hget(token, "user");
  if (!id) return { token, user: null };
  const cacheValue = await readCache<User>(id);
  if (cacheValue) {
    consola.info("用户访问", "缓存", JSON.stringify(cacheValue));
    return { token, user: cacheValue };
  }
  const user = await database.user.update({
    where: { id },
    data: { last_login: new Date() },
  });
  await writeCache(id, user);
  consola.info("用户访问", JSON.stringify(user));
  return { token, user };
});
