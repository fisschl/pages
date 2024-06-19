import IORedis from "ioredis";
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
