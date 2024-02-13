import { mongodb } from "~/server/utils/db";

export const logs = mongodb.collection("logs");

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await logs.insertOne({
    ...body,
    time: new Date(),
  });
  return { message: "成功" };
});
