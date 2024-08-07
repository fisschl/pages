import type { H3Event } from "h3";
import { randomBytes } from "node:crypto";
import { v7 as uuid } from "uuid";
import { database } from "~/server/database/postgres";
import { redis } from "~/server/database/redis";

export const generateRandomBase36 = (length: number) => {
  const base36Alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  const list: string[] = [];
  const alphabetLength = base36Alphabet.length;
  for (let i = 0; i < length; i++) {
    const [byte] = randomBytes(1);
    list.push(base36Alphabet[byte % alphabetLength]);
  }
  return list.join("");
};

export const generateToken = () => {
  return uuid() + "-" + generateRandomBase36(16);
};

/**
 * 从请求中获取 token
 */
export const useToken = (event: H3Event): string | undefined => {
  const getTokenFromQuery = () => {
    const { token } = getQuery(event);
    if (!token || typeof token !== "string") return;
    return token;
  };

  const getTokenFromHeader = () => {
    const header = getHeader(event, "token");
    return header || undefined;
  };

  const getTokenFromCookie = () => {
    return getCookie(event, "token");
  };

  return getTokenFromQuery() || getTokenFromHeader() || getTokenFromCookie();
};

export const useUserId = async (event: H3Event) => {
  const token = useToken(event);
  if (!token) return;
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
