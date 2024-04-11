import { publisher, request_schema } from ".";

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, request_schema.parse);
  const data = await readRawBody(event);
  if (!data) throw createError({ status: 400 });
  await publisher.publish(key, JSON.stringify(data));
  return { message: "成功" };
});
