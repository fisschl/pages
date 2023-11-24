export default defineEventHandler(async (event) => {
  const { name, password } = getQuery(event);
  const user = await db.user.findFirst({
    where: { name: String(name), password: hashPassword(String(password)) },
  });
  if (!user) throw createError({ status: 401 });
  const token = getSessionKey();
  setCookie(event, "token", token);
  await redis.set(token, JSON.stringify(user), {
    EX: 60 * 60 * 24 * 30,
  });
  return true;
});
