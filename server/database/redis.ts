import { createClient } from "redis";

const { REDIS_URL } = process.env;

export const redis = createClient({
  url: REDIS_URL,
});
redis.connect().then(() => {
  console.log("redis connected");
});

export const MS = 1000;
export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

export const publisher = redis.duplicate();
publisher.connect().then(() => {
  console.log("redis publisher connected");
});

export const subscriber = redis.duplicate();
subscriber.connect().then(() => {
  console.log("redis subscriber connected");
});
