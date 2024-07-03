import type { H3Event } from "h3";
import { database } from "~/server/database/postgres";
import { DAY, redis } from "~/server/database/redis";
import { v7 as uuid } from "uuid";
import { customAlphabet } from "nanoid";
import { z } from "zod";

export const randomToken = customAlphabet("abcdefghijklmnopqrstuvwxyz234567");

export const generateToken = () => {
  return uuid() + "-" + randomToken();
};

const tokenSchema = z.string().min(10);

/**
 * 从请求中获取 token
 */
export const useToken = (event: H3Event): string => {
  {
    const cookie = getCookie(event, "token");
    if (cookie) return cookie;
  }
  {
    const header = getHeader(event, "token");
    const result = tokenSchema.safeParse(header);
    if (result.success) return result.data;
  }
  {
    const { token } = getQuery(event);
    const result = tokenSchema.safeParse(token);
    if (result.success) return result.data;
  }
  {
    const token = generateToken();
    setCookie(event, "token", token, { maxAge: 30 * DAY });
    return token;
  }
};

export const useUserId = async (event: H3Event) => {
  const token = useToken(event);
  const id = await redis.hget(token, "user");
  return id || undefined;
};

export const use401 = async (event: H3Event) => {
  const user_id = await useUserId(event);
  if (!user_id) throw createError({ status: 401 });
  return user_id;
};

export const use403 = async (event: H3Event) => {
  const user_id = await useUserId(event);
  if (!user_id) throw createError({ status: 403 });
  return user_id;
};

export const useUserInfo = async (user_id: string) => {
  const data = await database.user.findUnique({
    where: { id: user_id },
  });
  return data || undefined;
};
