import { prisma } from "./user";
import { createHash } from "crypto";

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

const SALT = "GO GO GO!";

export const hashPassword = (password: string): string => {
  return createHash("sha512")
    .update(password + SALT)
    .digest("base64url");
};
