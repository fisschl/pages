import { z } from "zod";
import { OPENAI_MODEL } from "~/server/api/chat/send";
import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";
import { parseMarkdown } from "../markdown";

const request_schema = z.object({
  create_at: z
    .string()
    .datetime()
    .catch(() => new Date().toISOString()),
});

export type MessagesQuery = z.input<typeof request_schema>;

export default defineEventHandler(async (event) => {
  const user = await use401(event);
  const { create_at } = await getValidatedQuery(event, request_schema.parse);
  const history = await database.ai_chat.findMany({
    where: { user_id: user, create_at: { lt: create_at } },
    orderBy: { create_at: "desc" },
    take: 16,
    include: { images: true },
  });
  for (const item of history) {
    item.content = await parseMarkdown(item.content);
  }
  history.reverse();
  return {
    list: history,
    model: OPENAI_MODEL,
  };
});
