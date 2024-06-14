import { useToken } from "~/server/utils/user";
import { redis } from "~/server/database/redis";

export default defineEventHandler(async (event) => {
  const token = useToken(event);
  await redis.hdel(token, "translate_api");
});
