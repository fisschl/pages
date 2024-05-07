import { z } from "zod";
import { database } from "~/server/database/postgres";
import { DAY, redis } from "~/server/database/redis";
import { argon2Verify } from "hash-wasm";
import { useToken } from "~/server/utils/user";

const request_schema = z.object({
  name: z.string(),
  password: z.string(),
});

/**
 * 登录
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, request_schema.parse);
  const user = await database.user.findUnique({
    where: { name: body.name },
  });
  if (!user) throw createError({ status: 401 });
  const ok = await argon2Verify({
    password: body.password,
    hash: user.password,
  });
  if (!ok) throw createError({ status: 401 });
  const token: string = useToken(event);
  await redis.hset(token, { user: user.id });
  await redis.expire(token, 30 * DAY);
  return { token };
});
