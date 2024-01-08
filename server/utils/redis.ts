import { createClient } from "redis";

const { REDIS_URL } = process.env;

export const redis = createClient({
  url: REDIS_URL,
});

await redis.connect();
export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
