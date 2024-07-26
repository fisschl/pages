import { useToken } from "~/server/utils/user";
import { redis } from "~/server/database/redis";
import { hash } from "ohash";

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  const id = await redis.hget(token, "user");
  if (!id) throw createError({ status: 401 });
  const key = hash(id) + "-" + hash(token);
  await redis.sadd(key, `${id}/ai_chat`);
  return {
    token: key,
  };
});
