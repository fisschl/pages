import { database } from "~/server/database/postgres";
import { z } from "zod";

const request_schema = z.object({
  key: z.string(),
});

export default defineEventHandler(async (event) => {
  const { key } = await readValidatedBody(event, request_schema.parse);
  await database.chat_file.create({
    data: { key },
  });
  return { message: "添加成功" };
});
