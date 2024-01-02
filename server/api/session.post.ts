import { hashPassword } from "./user.post";
import { typeid } from "typeid-js";
import { user } from "@prisma/client";
import type { EventHandlerRequest, H3Event } from "h3";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import { isString } from "lodash-es";
import { prisma, redis } from "~/server/api/user.get";

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody(event);
  const user = await prisma.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  const token = typeid().toString() + nanoid(32);
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.json.set(token, "$", user);
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

export const checkUser = async (event: H3Event<EventHandlerRequest>) => {
  const token = getToken(event);
  if (!token) throw createError({ status: 401 });
  const user: any = await redis.json.get(token);
  if (!user) throw createError({ status: 403 });
  user.token = token;
  return user as user & { token: string };
};
