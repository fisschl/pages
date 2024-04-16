import { database } from "~/server/database/postgres";
import { checkUser } from "../auth/index.post";
import { z } from "zod";

const request_schema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id } = await getValidatedQuery(event, request_schema.parse);
  await database.ai_chat.delete({
    where: { id },
  });
  return { message: "删除成功" };
});
