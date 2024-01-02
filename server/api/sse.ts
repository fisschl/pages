import { redis } from "~/server/api/user.get";

const createPubSub = () => {
  const publisher = redis.duplicate();
  publisher.connect();
  const subscriber = redis.duplicate();
  subscriber.connect();
  return { publisher, subscriber };
};

export const { publisher, subscriber } = createPubSub();

export default defineEventHandler(async (event) => {
  setHeaders(event, {
    "Transfer-Encoding": "chunked",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  });

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const sendMessage = async (message: string) => {
    const line = `data: ${message} \n\n`;
    await writer.write(encoder.encode(line));
  };

  await subscriber.subscribe(`sse`, sendMessage);

  const { req, res } = event.node;
  const cleanup = async () => {
    if (!writer.closed) await writer.close();
    if (!res.closed) res.end();
    await subscriber.unsubscribe(`sse`, sendMessage);
  };

  req.on("close", cleanup);
  req.on("end", cleanup);

  await sendStream(event, readable);
});
