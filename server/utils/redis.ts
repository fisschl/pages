import { once } from "lodash-es";
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export const connect = once(async () => {
  await redis.connect();
});

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;
