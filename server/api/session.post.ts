import { hashPassword } from "./user.post";
import type { EventHandlerRequest, H3Event } from "h3";
import { addDays, parseISO } from "date-fns";
import { nanoid } from "nanoid";
import { isString } from "lodash-es";
import { typeid } from "typeid-js";
import type { user } from "@prisma/client";
import { prisma } from "~/server/utils/db";
import { DAY, redis } from "~/server/utils/redis";

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody(event);
  const user = await prisma.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  const token = typeid().toString() + nanoid(24);
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.set(token, user.id);
  await redis.expireAt(token, expires);
  return { message: "登陆成功" };
});

export const getToken = (event: H3Event<EventHandlerRequest>) => {
  const cookie = getCookie(event, "token");
  if (cookie) return cookie;
  const query = getQuery(event);
  if (isString(query.token)) return query.token;
  return undefined;
};

export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<user> => {
  const token = getToken(event);
  if (!token) throw createError({ status: 401 });
  const id = await redis.get(token);
  if (!id) throw createError({ status: 403 });
  const str = await redis.get(id);
  if (str) {
    const user = JSON.parse(str);
    user.update_at = parseISO(user.update_at);
    return user;
  }
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) throw createError({ status: 404 });
  await redis.set(user.id, JSON.stringify(user), {
    EX: 60 * DAY,
  });
  return user;
};
