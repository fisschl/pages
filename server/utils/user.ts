import type { user } from "@prisma/client";
import type { H3Event, EventHandlerRequest } from "h3";

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
