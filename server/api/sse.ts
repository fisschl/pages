import type { EventHandlerRequest, H3Event } from "h3";
import { checkUserSafe } from "../utils/password";
import { subscriber } from "../database/redis";

export const useSseKey = async (event: H3Event<EventHandlerRequest>) => {
  const user = await checkUserSafe(event);
  if (typeof user === "number") return `sse:guest`;
  return `sse:${user.id}`;
};

export default defineEventHandler(async (event) => {
  if (!subscriber.isOpen) await subscriber.connect();
  const sseKey = await useSseKey(event);

  setHeader(event, "Transfer-Encoding", "chunked");
  setHeader(event, "Content-Type", "text/event-stream");
  setHeader(event, "Connection", "keep-alive");
  setHeader(event, "Cache-Control", "no-cache");

  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  const sendMessage = async (message: string) => {
    const line = `data: ${message} \n\n`;
    await writer.write(encoder.encode(line));
  };

  await subscriber.subscribe(sseKey, sendMessage);

  const { req, res } = event.node;

  const cleanup = async () => {
    if (!writer.closed) await writer.close();
    if (!res.closed) res.end();
    await subscriber.unsubscribe(sseKey, sendMessage);
  };

  req.on("close", cleanup);
  req.on("end", cleanup);

  await sendStream(event, readable);
});
