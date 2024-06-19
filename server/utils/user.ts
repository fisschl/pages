import type { H3Event } from "h3";
import { isString } from "lodash-es";
import { database } from "~/server/database/postgres";
import { DAY, redis } from "~/server/database/redis";
import { uuid } from "~/server/utils/uuid";

/**
 * 从请求中获取 token
 */
export const useToken = (event: H3Event): string => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const header = getHeader(event, "token");
  if (header) return header;
  const query = getQuery(event);
  if (query.token && isString(query.token)) return query.token;
  const token = uuid(32);
  setCookie(event, "token", token, { maxAge: 30 * DAY });
  return token;
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
