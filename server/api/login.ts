import { addDays, differenceInSeconds } from "date-fns";

export default defineEventHandler(async (event) => {
  const { name, password } = getQuery(event);
  const user = await db.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  const token = getSessionKey();
  const expires = addDays(new Date(), 30);
  setCookie(event, "token", token, { expires, httpOnly: true });
  await redis.set(token, JSON.stringify(user), {
    EX: differenceInSeconds(expires, new Date()),
  });
  return true;
});
