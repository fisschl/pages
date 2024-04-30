import { z } from "zod";
import { useChannel } from "~/server/database/rabbitmq";

export const request_schema = z.object({
  key: z.string(),
});

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, request_schema.parse);

  const sse = createEventStream(event);

  const channel = await useChannel();
  const queue = await channel.assertQueue("", {
    exclusive: true,
    autoDelete: true,
  });
  await channel.assertExchange(key, "fanout", { autoDelete: true });
  await channel.bindQueue(queue.queue, key, "");

  const consume = await channel.consume(queue.queue, async (message) => {
    if (!message) return;
    await sse.push(message.content.toString());
  });

  sse.onClosed(async () => {
    await channel.cancel(consume.consumerTag);
    await channel.deleteQueue(queue.queue);
    await channel.close();
  });

  return sse.send();
});

export const usePublisher = async (key: string) => {
  const channel = await useChannel();
  await channel.assertExchange(key, "fanout", { autoDelete: true });

  const publish = (message: string) => {
    channel.publish(key, "", Buffer.from(message));
  };

  return { publish };
};
