import { createHash } from "crypto";
import { prisma } from "./session.get";

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody(event);
  if (!name || !password) {
    throw createError({ status: 400 });
  }
  await prisma.user.create({
    data: { name, password: hashPassword(password) },
  });
  return { message: "注册成功" };
});

const SALT = "GO GO GO!";

export const hashPassword = (password: string): string => {
  return createHash("sha512")
    .update(password + SALT)
    .digest("base64url");
};
