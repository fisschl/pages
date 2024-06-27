import IORedis from "ioredis";
import { URL } from "node:url";
import { encode, decode } from "@msgpack/msgpack";

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

export const writeCache = async <T extends object>(
  key: string,
  value: T,
  ttl: number = 30 * DAY,
) => {
  const encoded = encode(value);
  const buffer = Buffer.from(
    encoded.buffer,
    encoded.byteOffset,
    encoded.byteLength,
  );
  await redis.setex(key, ttl, buffer);
  return value;
};

export const readCache = async <T = any>(key: string): Promise<T | null> => {
  const buffer = await redis.getBuffer(key);
  if (!buffer) return null;
  return decode(buffer) as T;
};
