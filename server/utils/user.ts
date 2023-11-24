import type { User } from "@prisma/client";
import type { H3Event, EventHandlerRequest } from "h3";

export const getUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User | undefined> => {
  const token = getCookie(event, "token");
  if (!token) return;
  const str = await redis.get(token);
  if (!str) return;
  return JSON.parse(str);
};

export const checkUser: typeof getUser = async (
  event: H3Event<EventHandlerRequest>,
): Promise<User> => {
  const user = await getUser(event);
  if (!user) throw createError({ status: 401 });
  return user;
};
