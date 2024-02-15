import { eq } from "drizzle-orm";
import type { EventHandlerRequest, H3Event } from "h3";
import { argon2Verify, argon2id } from "hash-wasm";
import { isString } from "lodash-es";
import { DAY, redis } from "~/server/utils/redis";
import { User } from "~/server/utils/schema";
import { db } from "~/server/utils/db";

export const hashPassword = async (password: string) => {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 256,
    memorySize: 512,
    hashLength: 32,
    outputType: "encoded",
  });
};

export const verifyPassword = async (password: string, hash: string) => {
  return await argon2Verify({
    password,
    hash,
  });
};

/**
 * 从请求中获取 token
 */
export const tokenFromContext = (event: H3Event<EventHandlerRequest>) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const header = getHeader(event, "token");
  if (header) return header;
  const query = getQuery(event);
  if (isString(query.token)) return query.token;
  return undefined;
};

/**
 * 校验 token 是否正确
 */
export const checkUserSafe = async (
  event: H3Event<EventHandlerRequest>,
  token?: string,
): Promise<User | undefined> => {
  if (!redis.isOpen) await redis.connect();
  if (!token) token = tokenFromContext(event);
  if (!token) return;
  const id = await redis.get(token);
  if (!id) return;
  const userJson = await redis.get(id);
  if (userJson) return JSON.parse(userJson);
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw createError({ status: 404 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  return user;
};

/**
 * 获取当前用户
 */
export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User> => {
  const res = await checkUserSafe(event);
  if (!res) throw createError({ status: 403 });
  return res;
};
