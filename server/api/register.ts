import { prisma } from "../utils/password";

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody(event);
  if (!name || !password) {
    throw createError({ status: 400 });
  }
  await prisma.user.create({
    data: { name, password: hashPassword(password) },
  });
  return true;
});
