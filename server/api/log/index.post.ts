import { mongodb } from "~/server/utils/db";

export const logs = mongodb.collection("logs");

export const writeLog = async (
  metadata: string | object,
  content: string | number | boolean | object,
) => {
  await logs.insertOne({
    timestamp: new Date(),
    metadata,
    content,
  });
};

export default defineEventHandler(async (event) => {
  const { metadata, content } = await readBody(event);
  await writeLog(metadata, content);
  return { message: "成功" };
});
