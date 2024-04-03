import Redis from "ioredis";
import type { Processor } from "bullmq";
import { Queue, Worker } from "bullmq";
import { URL } from "node:url";

const uri = new URL(process.env.REDIS_URL!);
export const redis = new Redis({
  username: uri.username,
  password: uri.password,
  host: uri.hostname,
  port: parseInt(uri.port),
  db: 0,
  maxRetriesPerRequest: null,
});

export const HOUR = 60 * 60;
export const DAY = 24 * HOUR;

export const publisher = redis.duplicate();

export const queue = new Queue("queue", { connection: redis });

export const processor: Record<string, Processor | undefined> = {};

export const worker = new Worker(
  "queue",
  async (job, token) => {
    const { name } = job;
    const item = processor[name];
    if (!item) return;
    return item(job, token);
  },
  {
    connection: redis,
    removeOnFail: { count: 1024 },
    removeOnComplete: { count: 1024 },
  },
);
