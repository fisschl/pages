import { database } from "~/server/database/postgres";
import { checkUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { z } from "zod";

const request_schema = z.object({
  create_at: z
    .string()
    .datetime()
    .catch(() => new Date().toISOString()),
});

export type MessagesQuery = z.input<typeof request_schema>;

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { create_at } = await getValidatedQuery(event, request_schema.parse);
  const history = await database.ai_chat.findMany({
    where: { user_id: user.id, create_at: { lt: create_at } },
    orderBy: { create_at: "desc" },
    take: 16,
    include: { chat_file: true },
  });
  for (const item of history) {
    item.content = await parseMarkdown(item.content);
  }
  return history.reverse().map((item) => {
    return {
      ...item,
      user_id: undefined,
    };
  });
});
