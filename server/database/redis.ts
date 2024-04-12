import IORedis from "ioredis";
import { URL } from "node:url";
import { stringify, parse } from "superjson";
import { hash } from "ohash";

const uri = new URL(process.env.REDIS_URL!);
export const redis = new IORedis({
  username: uri.username,
  password: uri.password,
  host: uri.hostname,
  port: parseInt(uri.port),
  db: 0,
  maxRetriesPerRequest: null,
});

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

export const readCache = async <T = unknown>(key: string) => {
  const value = await redis.get(key);
  if (value) return parse<T>(value);
  return null;
};

export const writeCache = async <T = unknown>(
  key: string,
  value: T,
  expire = 60 * DAY,
) => {
  await redis.set(key, stringify(value), "EX", expire);
  return value;
};

export const cacheKey = (key: unknown): string => {
  if (Array.isArray(key)) {
    return key.map(cacheKey).filter(Boolean).join(":");
  }
  if (key === null || key === undefined) return "";
  if (typeof key === "number") return key.toString();
  if (typeof key === "boolean") return key.toString();
  if (typeof key === "string") return key;
  return hash(key);
};

export const useCache = async <T = unknown>(
  key: unknown,
  value: () => T | Promise<T>,
  expire = 60 * DAY,
) => {
  const keyString = cacheKey(key);
  const cached = await readCache<T>(keyString);
  if (cached) return cached;
  const result = await value();
  if (!result) return;
  return writeCache(keyString, result, expire);
};
