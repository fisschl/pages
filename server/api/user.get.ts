import { checkUser } from "./session.post";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export default defineEventHandler(async (event) => {
  return checkUser(event);
});

export const prisma = new PrismaClient();

const createRedisClient = () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });
  client.connect().then(() => {
    console.log("redis client connected");
  });
  return client;
};

export const redis = createRedisClient();

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
