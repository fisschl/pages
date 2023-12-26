import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { checkUser } from "./session.post";

export const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  return checkUser(event);
});
const createRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.connect();
  return client;
};
export const redis = createRedisClient();
export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
