import { redis } from "../../database/redis";
import { z } from "zod";

export const SSEQuerySchema = z.object({
  key: z.string(),
});

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, SSEQuerySchema.parse);
  const sse = createEventStream(event);
  const subscriber = redis.duplicate();
  await subscriber.subscribe(key);

  const push = async (channel: string, message: string) => {
    await sse.push(message);
  };

  subscriber.on("message", push);

  sse.onClosed(async () => {
    subscriber.off("message", push);
    await subscriber.unsubscribe(key);
    await subscriber.quit();
    await sse.close();
  });

  return sse.send();
});
