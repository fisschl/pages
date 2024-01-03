import { hashPassword } from "./user.post";
import { user } from "@prisma/client";
import type { EventHandlerRequest, H3Event } from "h3";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { isString } from "lodash-es";
import { DAY, prisma, redis } from "~/server/api/user.get";
import { typeid } from "typeid-js";

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody(event);
  const user = await prisma.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  await setUserCache(user);
  const token = typeid().toString() + nanoid(24);
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.set(token, user.id);
  await redis.expireAt(token, expires);
  return { message: "登陆成功" };
});

export const getUserCache = async (id: string): Promise<user | undefined> => {
  const str = await redis.get(id);
  if (str) return JSON.parse(str);
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) return undefined;
  await setUserCache(user);
  return user;
};

export const setUserCache = async (user: user) => {
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
};

export const getToken = (event: H3Event<EventHandlerRequest>) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const query = getQuery(event);
  if (isString(query.token)) return query.token;
  return undefined;
};

export const checkUser = async (event: H3Event<EventHandlerRequest>) => {
  const token = getToken(event);
  if (!token) throw createError({ status: 401 });
  const id = await redis.get(token);
  if (!id) throw createError({ status: 403 });
  const user = await getUserCache(id);
  if (!user) throw createError({ status: 404 });
  return user;
};
