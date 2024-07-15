import { decode, encode } from "@msgpack/msgpack";
import IORedis from "ioredis";
import { Buffer } from "node:buffer";
import { URL } from "node:url";

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

export const arrayToBuffer = (uintArray: Uint8Array) => {
  const { buffer, byteOffset, byteLength } = uintArray;
  return Buffer.from(buffer, byteOffset, byteLength);
};

export const writeCache = async <T extends object>(
  key: string,
  value: T,
  ttl: number = 30 * DAY,
) => {
  const encoded = encode(value);
  const buffer = arrayToBuffer(encoded);
  await redis.setex(key, ttl, buffer);
  return value;
};

export const readCache = async <T = any>(key: string): Promise<T | null> => {
  const buffer = await redis.getBuffer(key);
  if (!buffer) return null;
  return decode(buffer) as T;
};

export const useCache = async <T extends object>(
  key: string,
  fetchData: () => Promise<T> | T,
): Promise<T> => {
  const data = await readCache<T>(key);
  if (data) return data;
  const value = await fetchData();
  await writeCache(key, value);
  return value;
};
