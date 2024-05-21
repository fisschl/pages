import { z } from "zod";
import { database } from "~/server/database/postgres";
import { use403 } from "~/server/utils/user";

const request_schema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  await use403(event);
  const { id } = await getValidatedQuery(event, request_schema.parse);
  await database.ai_chat.update({
    where: { id },
    data: { deleted: true },
  });
  return { message: "删除成功" };
});
