import IORedis from "ioredis";
import { URL } from "node:url";
import { destr } from "destr";
import type { SerializeObject } from "nitropack";

const redis_url = new URL(process.env.REDIS_URL!);

export const redis = new IORedis({
  username: redis_url.username,
  password: redis_url.password,
  host: redis_url.hostname,
  port: parseInt(redis_url.port),
  db: 0,
  maxRetriesPerRequest: null,
});

export const HOUR = 60 * 60;

export const DAY = 24 * HOUR;

export const writeCache = async <T extends object>(
  key: string,
  value: T,
  ttl: number = 30 * DAY,
): Promise<SerializeObject<T>> => {
  const text = JSON.stringify(value);
  await redis.setex(key, ttl, text);
  return JSON.parse(text);
};

export const readCache = async <T = any>(key: string) => {
  const text = await redis.get(key);
  if (!text) return null;
  return destr<T>(text);
};

export const useRedisCache = async <T extends object>(
  key: string,
  fetchData: () => T | Promise<T>,
) => {
  const data = await readCache<SerializeObject<T>>(key);
  if (data) return data;
  const value = await fetchData();
  return writeCache(key, value);
};
