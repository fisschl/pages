import { createHash } from "crypto";


import { prisma } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const req = await readBody(event);
  const password = hashPassword(req.password);
  if (!password) throw createError({ status: 400 });
  await prisma.user.create({
    data: { ...req, password },
  });
  return { message: "注册成功" };
});

const SALT = "GO GO GO!";

export const hashPassword = (password?: string) => {
  if (!password) return undefined;
  return createHash("sha512")
    .update(password + SALT)
    .digest("base64url");
};
