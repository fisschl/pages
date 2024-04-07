import { z } from "zod";
import { SSEQuerySchema, checkConnection, publisher, subscriber } from ".";
import { getQuery } from "ufo";

const query_key = (url: string) => {
  const query = getQuery(url);
  const { key } = SSEQuerySchema.parse(query);
  return key;
};

const effects = new Map<string, () => unknown>();

const MessageSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export default defineWebSocketHandler({
  open: async (peer) => {
    await checkConnection();
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
    const { key, value } = MessageSchema.parse(JSON.parse(text));
    await publisher.publish(key, value);
  },
  close: async (peer) => {
    const { id } = peer;
    const effect = effects.get(id);
    if (effect) await effect();
  },
});
