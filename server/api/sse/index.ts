import { z } from "zod";
import { createClient } from "redis";

export const SSEQuerySchema = z.object({
  key: z.string(),
});

const subscriber = createClient({
  url: process.env.REDIS_URL,
});

export const publisher = subscriber.duplicate();

export default defineEventHandler(async (event) => {
  if (!subscriber.isOpen) await subscriber.connect();
  if (!publisher.isOpen) await publisher.connect();
  const { key } = await getValidatedQuery(event, SSEQuerySchema.parse);
  const sse = createEventStream(event);
  const push = async (message: string) => {
    await sse.push(message);
  };
  await subscriber.subscribe(key, push);
  sse.onClosed(async () => {
    await subscriber.unsubscribe(key, push);
    await sse.close();
  });
  return sse.send();
});
