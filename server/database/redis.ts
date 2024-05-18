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

export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export const cacheKey = (key: unknown): string => {
  if (typeof key === "string") return key;
  if (Array.isArray(key)) return key.map(cacheKey).filter(Boolean).join(":");
  if (typeof key === "number") return key.toString();
  if (typeof key === "bigint") return key.toString();
  if (key && typeof key === "object") return hash(key);
  return "";
};

export const cache = <Q extends unknown[], A>(
  func: (...args: Q) => A,
  expire = 60 * DAY,
) => {
  return async (...args: Q) => {
    const key = cacheKey(args);
    const value = await readCache<A>(key);
    if (value) return value;
    const result = await func(...args);
    await writeCache(key, result, expire);
    return result;
  };
};
