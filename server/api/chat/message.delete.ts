import { eq } from "drizzle-orm";
import { z } from "zod";
import { database } from "~/server/database/postgres";
import { ai_chats, chat_files } from "~/server/database/schema";
import { useCurrentUser } from "../auth/index.post";
import { oss } from "../oss/download";

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await useCurrentUser(event);
  if (!user) throw createError({ status: 403 });
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  const files = await database
    .delete(chat_files)
    .where(eq(chat_files.chat_id, id))
    .returning();
  for (const { key } of files) {
    if (!key) continue;
    await oss.delete(key);
  }
  await database.delete(ai_chats).where(eq(ai_chats.id, id));
  return { message: "删除成功" };
});
