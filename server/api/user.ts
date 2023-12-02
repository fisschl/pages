import { PrismaClient } from "@prisma/client";
import { checkUser } from "~/server/api/login";
import { createClient } from "redis";

export const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
const createRedisClient = () => {
  const redis = createClient({
    url: process.env.REDIS_URL,
  });
  redis.on("error", (err) => console.log("Redis Client Error", err));
  redis.connect().then(() => console.log("Redis Connected"));
  return redis;
};
export const redis = createRedisClient();
export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
