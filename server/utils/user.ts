import type { user } from "@prisma/client";
import type { H3Event, EventHandlerRequest } from "h3";

export const getUser = async (token: string): Promise<user | undefined> => {
  const str = await redis.get(token);
  if (!str) return;
  return JSON.parse(str);
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
