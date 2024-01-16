import { argon2id, argon2Verify } from "hash-wasm";
import type { EventHandlerRequest, H3Event } from "h3";
import { User } from "~/server/utils/schema";
import { DAY, redis } from "~/server/utils/redis";
import { parseISO } from "date-fns";
import { eq } from "drizzle-orm";
import { isString } from "lodash-es";

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

export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User> => {
  const token = tokenFromContext(event);
  if (!token) throw createError({ status: 401 });
  const id = await redis.get(token);
  if (!id) throw createError({ status: 403 });
  const str = await redis.get(id);
  if (str) {
    const user = JSON.parse(str);
    user.update_at = parseISO(user.update_at);
    return user;
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) throw createError({ status: 404 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  return user;
};
