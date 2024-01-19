import type { H3Event, EventHandlerRequest } from "h3";
import { checkUserSafe } from "../utils/password";
import { subscriber } from "../utils/redis";
import { cpus, totalmem, freemem } from "node:os";

export const useSseKey = async (event: H3Event<EventHandlerRequest>) => {
  const user = await checkUserSafe(event);
  if (typeof user === "number") return `sse:guest`;
  return `sse:${user.id}`;
};

/**
 * user CPU 在用户模式下花费的毫秒数。
 * nice CPU 在良好模式下花费的毫秒数。
 * sys CPU 在系统模式下花费的毫秒数。
 * idle CPU 在空闲模式下花费的毫秒数。
 * irq CPU 在中断请求模式下花费的毫秒数。
 */
export const cpuUsage = async () => {
  const _list = cpus();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return cpus().map((item, index) => {
    const _item = _list[index];
    item.times.user -= _item.times.user;
    item.times.nice -= _item.times.nice;
    item.times.sys -= _item.times.sys;
    item.times.idle -= _item.times.idle;
    item.times.irq -= _item.times.irq;
    return item;
  });
};

const analysis = async () => {
  const cpu = await cpuUsage();
  const mem = {
    total: totalmem(),
    used: totalmem() - freemem(),
  };
  return { cpu, mem, time: new Date().toISOString() };
};

export type AnalysisData = Awaited<ReturnType<typeof analysis>>;

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

  const analysisTimer = setInterval(async () => {
    const str = JSON.stringify({
      type: "analysis",
      data: await analysis(),
    });
    sendMessage(str);
  }, 1000);

  const { req, res } = event.node;

  const cleanup = async () => {
    if (!writer.closed) await writer.close();
    if (!res.closed) res.end();
    await subscriber.unsubscribe(sseKey, sendMessage);
    clearInterval(analysisTimer);
  };

  req.on("close", cleanup);
  req.on("end", cleanup);

  await sendStream(event, readable);
});
