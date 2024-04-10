import { database } from "~/server/database/postgres";
import { checkUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";
import { type Input, fallback, object, string, parse } from "valibot";

const QuerySchema = object({
  create_at: fallback(string(), () => new Date().toISOString()),
});

export type MessagesQuery = Input<typeof QuerySchema>;

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { create_at } = await getValidatedQuery(event, (value) =>
    parse(QuerySchema, value),
  );
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
