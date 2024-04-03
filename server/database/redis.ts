import Redis from "ioredis";
import { Processor, Queue, Worker } from "bullmq";

const { REDIS_URL } = process.env;

export const redis = new Redis(REDIS_URL!);
redis.options.maxRetriesPerRequest = null;

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
