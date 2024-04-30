import { z } from "zod";
import { useChannel } from "~/server/database/rabbitmq";
import { getQuery } from "ufo";
import type { Channel } from "amqplib";

export const request_schema = z.object({
  key: z.string(),
});

const query_key = (url: string) => {
  const query = getQuery(url);
  const { key } = request_schema.parse(query);
  return key;
};

interface State {
  close: () => unknown;
  channel: Channel;
}

const status = new Map<string, State>();

export default defineWebSocketHandler({
  open: async (peer) => {
    const key = query_key(peer.url);

    const channel = await useChannel();
    const queue = await channel.assertQueue("", {
      exclusive: true,
      autoDelete: true,
    });
    await channel.assertExchange(key, "fanout", { autoDelete: true });
    await channel.bindQueue(queue.queue, key, "");

    const consume = await channel.consume(queue.queue, (message) => {
      if (!message) return;
      peer.send(message.content.toString());
    });

    const close = async () => {
      await channel.cancel(consume.consumerTag);
      await channel.close();
      status.delete(peer.id);
    };

    status.set(peer.id, { channel, close });
  },
  message: async (peer, event) => {
    const text = event.text();
    const items = JSON.parse(text);
    if (!items) return;
    const state = status.get(peer.id);
    if (!state) return;
    const { channel } = state;
    Object.entries(items).forEach(([key, value]) => {
      channel.publish(key, "", Buffer.from(JSON.stringify(value)));
    });
  },
  close: async (peer) => {
    const state = status.get(peer.id);
    if (!state) return;
    await state.close();
  },
});

export const usePublisher = async (key: string) => {
  const channel = await useChannel();
  await channel.assertExchange(key, "fanout", { autoDelete: true });

  const publish = (message: string) => {
    channel.publish(key, "", Buffer.from(message));
  };

  return { publish };
};
