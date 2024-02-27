import { createClient } from "redis";

const { REDIS_URL } = process.env;

export const redis = createClient({
  url: REDIS_URL,
});

export const MS = 1000;
export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

export const publisher = redis.duplicate();

export const subscriber = redis.duplicate();
