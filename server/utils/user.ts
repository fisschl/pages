import type { user } from "@prisma/client";
import type { H3Event, EventHandlerRequest } from "h3";

export const getUser = async (token: unknown): Promise<user | undefined> => {
  if (!token || typeof token !== "string") return;
  const str = await redis.get(token);
  if (!str) return;
  return JSON.parse(str);
};

export const checkUser = async (
  event: H3Event<EventHandlerRequest>,
  token?: unknown,
): Promise<user> => {
  if (!token) token = getCookie(event, "token");
  const user = await getUser(token);
  if (!user) throw createError({ status: 401 });
  return user;
};
