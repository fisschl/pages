import { subscriber } from "../../database/redis";
import { z } from "zod";

export const SSEQuerySchema = z.object({
  key: z.string(),
});

export default defineEventHandler(async (event) => {
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
