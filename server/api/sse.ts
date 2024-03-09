import { isString } from "lodash-es";
import { subscriber } from "../database/redis";

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event);
  if (!key || !isString(key)) throw createError({ status: 400 });
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
