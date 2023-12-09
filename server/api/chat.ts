import { isString } from "lodash-es";
import { prisma, redis } from "./user";

const createPubSub = () => {
  const publisher = redis.duplicate();
  publisher.connect();
  const subscriber = redis.duplicate();
  subscriber.connect();
  return { publisher, subscriber };
};

export const { publisher, subscriber } = createPubSub();

export default defineEventHandler(async (event) => {
  const { message } = await readBody(event);
  if (!isString(message)) throw createError({ status: 400 });
  const data = await prisma.chat.create({
    data: { message },
  });
  await publisher.publish(`sse`, JSON.stringify({ ...data, type: "chat" }));
  return { message: "发送成功" };
});
