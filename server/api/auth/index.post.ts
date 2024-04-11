import type { user } from "@prisma/client";
import { base58 } from "@scure/base";
import type { H3Event } from "h3";
import { isString } from "lodash-es";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { DAY, readCache, redis, writeCache } from "~/server/database/redis";
import { verifyPassword } from "~/server/utils/password";
import { timeBytes } from "~/server/utils/uuid";

export const generateToken = () => {
  const time = timeBytes();
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  const bytes = new Uint8Array([...time, ...random]);
  return base58.encode(bytes);
};

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
  const ok = await verifyPassword(body.password, user.password);
  if (!ok) throw createError({ status: 401 });
  const update_user = await database.user.update({
    where: { id: user.id },
    data: { last_login: new Date() },
  });
  await writeCache(update_user.id, update_user);
  const token = useToken(event);
  await redis.hset(token, { user: user.id });
  await redis.expire(token, 30 * DAY);
  update_user.password = "******";
  return update_user;
});

/**
 * 从请求中获取 token
 */
export const useToken = (event: H3Event) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const header = getHeader(event, "token");
  if (header) return header;
  const query = getQuery(event);
  if (query.token && isString(query.token)) return query.token;
  const token = generateToken();
  setCookie(event, "token", token, {
    maxAge: 30 * DAY,
  });
  return token;
};

export const useUser = async (event: H3Event): Promise<user | undefined> => {
  const token = useToken(event);
  const user_id = await redis.hget(token, "user");
  if (!user_id) return;
  const cache_user = await readCache<user>(user_id);
  if (cache_user) return cache_user;
  const user = await database.user.findUnique({
    where: { id: user_id },
  });
  if (!user) return;
  user.password = "******";
  await writeCache(user.id, user);
  return user;
};

/**
 * 获取当前用户
 */
export const checkUser = async (event: H3Event) => {
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  return user;
};
