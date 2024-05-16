import type { H3Event } from "h3";
import { DAY, redis, useCache } from "~/server/database/redis";
import { database } from "~/server/database/postgres";
import { isString } from "lodash-es";
import { uuid } from "~/server/utils/uuid";

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
  const token = uuid(16);
  setCookie(event, "token", token, { maxAge: 30 * DAY });
  return token;
};

export const useUser = async (event: H3Event) => {
  const token = useToken(event);
  const user_id = await redis.hget(token, "user");
  if (!user_id) return;
  const user = await useCache(user_id, async () => {
    return database.user.findUnique({
      where: { id: user_id },
    });
  });
  return user || undefined;
};

/**
 * 获取当前用户
 */
export const checkUser = async (event: H3Event) => {
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  return user;
};
