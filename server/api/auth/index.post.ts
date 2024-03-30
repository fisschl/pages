import { eq } from "drizzle-orm";
import type { H3Event } from "h3";
import { isString } from "lodash-es";
import { database } from "~/server/database/postgres";
import { DAY, redis } from "~/server/database/redis";
import type { User} from "~/server/database/schema";
import { UserInsertSchema, users } from "~/server/database/schema";
import { verifyPassword } from "~/server/utils/password";
import { $token } from "~/server/utils/token";

/**
 * 登录
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, BodySchema.parse);
  const user = await database.query.users.findFirst({
    where: eq(users.name, body.name),
  });
  if (!user) throw createError({ status: 401 });
  const ok = await verifyPassword(body.password, user.password);
  if (!ok) throw createError({ status: 401 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  const session = useSession(event);
  await session.set("user", user.id);
  user.password = "******";
  return user;
});

const BodySchema = UserInsertSchema.pick({ name: true, password: true });

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
  const _token = $token();
  setCookie(event, "token", _token, {
    maxAge: 30 * DAY,
  });
  return _token;
};

export const useSession = (event: H3Event) => {
  const token = useToken(event);
  const get = async (name: string) => {
    return redis.hGet(token, name);
  };
  const set = async (name: string, value: string) => {
    await redis.hSet(token, name, value);
    await redis.expire(token, 30 * DAY);
  };
  return { token, get, set };
};

export const useCurrentUser = async (
  event: H3Event,
): Promise<User | undefined> => {
  const session = useSession(event);
  const user_id = await session.get("user");
  if (!user_id) return;
  const user_str = await redis.get(user_id);
  if (user_str) return JSON.parse(user_str);
  const user = await database.query.users.findFirst({
    where: eq(users.id, user_id),
  });
  if (!user) return;
  user.password = "******";
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  return user;
};

/**
 * 获取当前用户
 */
export const checkUser = async (event: H3Event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  return user;
};
