import IORedis from "ioredis";
import { URL } from "node:url";
import { stringify, parse } from "superjson";

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
