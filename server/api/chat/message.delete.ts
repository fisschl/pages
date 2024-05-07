import { database } from "~/server/database/postgres";
import { z } from "zod";
import { oss } from "~/server/api/oss/download";
import { checkUser } from "~/server/utils/user";

const request_schema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id } = await getValidatedQuery(event, request_schema.parse);
  const files = await database.chat_file.findMany({
    where: {
      ai_chat: {
        every: { id },
      },
    },
  });
  for (const item of files) {
    await oss.delete(item.key);
    await database.chat_file.delete({ where: { key: item.key } });
  }
  await database.ai_chat.delete({
    where: { id },
  });
  return { message: "删除成功" };
});
