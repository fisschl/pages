import { z } from "zod";
import { publish, rabbit } from "~/server/database/rabbitmq";
import { getQuery } from "ufo";
import { destr } from "destr";
import { isObject } from "lodash-es";
import { EventEmitter } from "node:events";

export const request_schema = z.object({
  key: z.string(),
});

const query_key = (url: string) => {
  const query = getQuery(url);
  const { key } = request_schema.parse(query);
  return key;
};

const emitter = new EventEmitter();

export default defineWebSocketHandler({
  open: async (peer) => {
    const key = query_key(peer.url);

    const channel = await (await rabbit).createChannel();
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

    emitter.once(`${peer.id}:close`, async () => {
      await channel.cancel(consume.consumerTag);
      await channel.unbindQueue(queue.queue, key, "");
      await channel.deleteQueue(queue.queue);
      await channel.close();
    });
  },
  message: async (peer, event) => {
    const items = destr(event.text());
    if (!isObject(items)) return;
    Object.entries(items).forEach(async ([key, value]) => {
      await publish(key, JSON.stringify(value));
    });
  },
  close: async (peer) => {
    emitter.emit(`${peer.id}:close`);
  },
});
