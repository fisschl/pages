import type { user as User } from "@prisma/client";
import { consola } from "consola";
import type { SerializeObject } from "nitropack";
import { database } from "~/server/database/postgres";
import { redis, useCache } from "~/server/database/redis";
import { useToken } from "~/server/utils/user";

export type UserResponse = SerializeObject<User>;

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  const id = await redis.hget(token, "user");
  if (!id) return { token, user: null };
  const user = await useCache(id, async () => {
    return database.user.update({
      where: { id },
      data: { last_login: new Date() },
    });
  });
  consola.info("用户访问", JSON.stringify(user));
  return { token, user };
});
