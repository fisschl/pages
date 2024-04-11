import { createClient } from "redis";
import { z } from "zod";

export const request_schema = z.object({
  key: z.string(),
});

export const subscriber = createClient({
  url: process.env.REDIS_URL,
});

export const publisher = subscriber.duplicate();

export default defineEventHandler(async (event) => {
  if (!subscriber.isOpen) await subscriber.connect();
  if (!publisher.isOpen) await publisher.connect();
  const { key } = await getValidatedQuery(event, request_schema.parse);
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
