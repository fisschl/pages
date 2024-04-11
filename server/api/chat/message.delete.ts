import { database } from "~/server/database/postgres";
import { checkUser } from "../auth/index.post";
import { oss } from "../oss/download";
import { z } from "zod";

const request_schema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id } = await getValidatedQuery(event, request_schema.parse);
  const files = await database.chat_file.findMany({
    where: { chat_id: id },
  });
  for (const { key, id } of files) {
    if (!key) continue;
    await oss.delete(key);
    await database.chat_file.delete({ where: { id } });
  }
  return { message: "删除成功" };
});
