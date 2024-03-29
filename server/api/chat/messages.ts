import { database } from "~/server/database/postgres";
import { useCurrentUser } from "../auth/index.post";
import { ai_chats } from "~/server/database/schema";
import { and, desc, eq, lt } from "drizzle-orm";
import { z } from "zod";

const QuerySchema = z.object({
  update_at: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
});

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
    limit: 24,
  });
  return history.reverse();
});
