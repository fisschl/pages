import { createClient } from "redis";
import { object, parse, string } from "valibot";

export const SSEQuerySchema = object({
  key: string(),
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
  const { key } = await getValidatedQuery(event, (value) =>
    parse(SSEQuerySchema, value),
  );
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
