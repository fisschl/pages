import { addDays } from "date-fns/esm";
import { prisma } from "./user";
import { getRandomKey, hashPassword } from "./register";
import { createClient } from "redis";
import { user } from "@prisma/client";
import type { EventHandlerRequest, H3Event } from "h3";

export default defineEventHandler(async (event) => {
  const { name, password } = getQuery(event);
  const user = await prisma.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  const token = getRandomKey();
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.json.set(token, "$", user);
  await redis.expireAt(token, expires);
  return { message: "登陆成功" };
});

export const redis = (() => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.on("error", (err) => console.log("Redis Client Error", err));
  client.connect().then(() => console.log("Redis Connected"));
  return client;
})();

export const HOUR = 60 * 60;

export const DAY = 24 * HOUR;

export const getUser = async (token: string): Promise<user | undefined> => {
  const obj = await redis.json.get(token);
  if (!obj) return;
  return obj as user;
};

export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<user> => {
  const token = getCookie(event, "token");
  if (!token) throw createError({ status: 401 });
  const user = await getUser(token);
  if (!user) throw createError({ status: 403 });
  return user;
};
