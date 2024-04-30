import { request_schema, usePublisher } from ".";

export default defineEventHandler(async (event) => {
  const { key } = await getValidatedQuery(event, request_schema.parse);
  const data = await readRawBody(event);
  if (!data) throw createError({ status: 400 });
  const { publish } = await usePublisher(key);
  publish(data);
  return { message: "成功" };
});
