import { eq } from "drizzle-orm";
import type { EventHandlerRequest, H3Event } from "h3";
import { argon2Verify, argon2id } from "hash-wasm";
import { isString } from "lodash-es";
import { DAY, redis } from "~/server/utils/redis";
import { User } from "~/server/utils/schema";

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

export const tokenFromContext = (event: H3Event<EventHandlerRequest>) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const query = getQuery(event);
  if (isString(query.token)) return query.token;
  return undefined;
};

export const checkUserSafe = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User | number> => {
  const token = tokenFromContext(event);
  if (!token) return 401;
  const id = await redis.get(token);
  if (!id) return 403;
  const userJson = await redis.get(id);
  if (userJson) return JSON.parse(userJson);
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw createError({ status: 404 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  return user;
};

export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User> => {
  const res = await checkUserSafe(event);
  if (typeof res === "number") throw createError({ status: res });
  return res;
};
