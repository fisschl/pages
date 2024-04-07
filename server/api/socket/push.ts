import { SSEQuerySchema, publisher } from ".";

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, SSEQuerySchema.parse);
  const data = await readRawBody(event);
  if (!data) throw createError({ status: 400 });
  await publisher.publish(key, JSON.stringify(data));
  return { message: "成功" };
});
