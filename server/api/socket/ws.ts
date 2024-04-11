import { getQuery } from "ufo";
import { publisher, request_schema, subscriber } from ".";
import { z } from "zod";

const query_key = (url: string) => {
  const query = getQuery(url);
  const { key } = request_schema.parse(query);
  return key;
};

const effects = new Map<string, () => unknown>();

const message_schema = z.object({
  key: z.string(),
  value: z.string(),
});

export default defineWebSocketHandler({
  open: async (peer) => {
    if (!subscriber.isOpen) await subscriber.connect();
    if (!publisher.isOpen) await publisher.connect();
    const { id, url } = peer;
    const key = query_key(url);
    const push = async (message: string) => {
      peer.send(message);
    };
    await subscriber.subscribe(key, push);
    effects.set(id, () => {
      subscriber.unsubscribe(key, push);
    });
  },
  message: async (peer, event) => {
    const text = event.text();
    const { key, value } = message_schema.parse(JSON.parse(text));
    await publisher.publish(key, value);
  },
  close: async (peer) => {
    const { id } = peer;
    const effect = effects.get(id);
    if (effect) await effect();
  },
});
