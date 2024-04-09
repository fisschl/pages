import type { input } from "zod";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { checkUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";

const QuerySchema = z.object({
  update_at: z.string().default(() => new Date().toISOString()),
});

export type MessagesQuery = input<typeof QuerySchema>;

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { update_at } = await getValidatedQuery(event, QuerySchema.parse);
  const history = await database.ai_chat.findMany({
    where: { user_id: user.id, update_at: { lt: update_at } },
    orderBy: { update_at: "desc" },
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
