import { checkUser } from "~/server/utils/password";
import { redis } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  if (!redis.isOpen) await redis.connect();
  const user = await checkUser(event);
  user.password = "******";
  return user;
});
