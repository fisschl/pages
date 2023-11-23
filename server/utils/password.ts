import { PrismaClient } from "@prisma/client";
import { Buffer } from "buffer";
import { createHash } from "crypto";
import { nanoid } from "nanoid";
import { createClient } from "redis";

const SALT = "GO GO GO!";

export const hashPassword = (password: string): string => {
  return createHash("sha512")
    .update(password + SALT)
    .digest("base64url");
};

export const prisma = new PrismaClient();

export const redis = createClient({
  url: process.env.REDIS_URL,
});
redis.connect();

export const getSessionKey = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return nanoid() + Buffer.from(bytes).toString("base64url");
};
