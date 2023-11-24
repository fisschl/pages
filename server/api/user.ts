import { User } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "token");
  if (!token) throw createError({ status: 401 });
  const str = await redis.get(token);
  if (!str) throw createError({ status: 401 });
  const u: User = JSON.parse(str);
  return u;
});
