import { and, desc, eq, lt } from "drizzle-orm";
import type { input } from "zod";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { ai_chats } from "~/server/database/schema";
import { useCurrentUser } from "../auth/index.post";
import { parseMarkdown } from "../markdown";

const QuerySchema = z.object({
  update_at: z.string().default(() => new Date().toISOString()),
});

export type MessagesQuery = input<typeof QuerySchema>;

export default defineEventHandler(async (event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  const { update_at } = await getValidatedQuery(event, QuerySchema.parse);
  const history = await database.query.ai_chats.findMany({
    where: and(
      eq(ai_chats.user_id, user.id),
      lt(ai_chats.update_at, update_at),
    ),
    orderBy: desc(ai_chats.update_at),
    limit: 16,
    with: { files: true },
  });
  return history.reverse().map((item) => {
    return {
      ...item,
      content: parseMarkdown(item.content),
      user_id: undefined,
    };
  });
});
