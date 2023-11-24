import { once } from "lodash-es";
import { createClient } from "redis";

export const redis = createClient({
  url: process.env.REDIS_URL,
});

export const connect = once(async () => {
  await redis.connect();
});
