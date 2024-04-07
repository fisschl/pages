import { z } from "zod";
import { createClient } from "redis";

export const SSEQuerySchema = z.object({
  key: z.string(),
});

export const subscriber = createClient({
  url: process.env.REDIS_URL,
});

export const publisher = subscriber.duplicate();

export const checkConnection = async () => {
  if (!subscriber.isOpen) await subscriber.connect();
  if (!publisher.isOpen) await publisher.connect();
};

export default defineEventHandler(async (event) => {
  await checkConnection();
  const { key } = await getValidatedQuery(event, SSEQuerySchema.parse);
  const sse = createEventStream(event);
  const push = async (message: string) => {
    await sse.push(message);
  };
  await subscriber.subscribe(key, push);
  sse.onClosed(async () => {
    await subscriber.unsubscribe(key, push);
  });
  return sse.send();
});
