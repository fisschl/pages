import { prisma } from "./user";
import { nanoid } from "nanoid";
import { Buffer } from "buffer";
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

export const getRandomKey = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return nanoid() + Buffer.from(bytes).toString("base64url");
};
