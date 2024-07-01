import { z } from "zod";
import { OPENAI_MODEL } from "~/server/api/chat/send";
import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";
import { parseMarkdownCache } from "~/server/utils/markdown";

const request_schema = z.object({
  create_time: z
    .string()
    .datetime()
    .catch(() => new Date().toISOString()),
});

export default defineEventHandler(async (event) => {
  const user = await use401(event);
  const { create_time } = await getValidatedQuery(event, request_schema.parse);
  const history = await database.chat_message.findMany({
    where: {
      user_id: user,
      create_time: { lt: create_time },
    },
    orderBy: { create_time: "desc" },
    take: 16,
    include: { images: true },
  });
  history.reverse();
  for (const item of history) {
    item.content = await parseMarkdownCache(item.content);
  }
  return {
    list: history,
    model: OPENAI_MODEL,
  };
});
