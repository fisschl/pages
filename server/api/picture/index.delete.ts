import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { database } from "~/server/database/postgres";
import { pictures } from "~/server/database/schema";
import { counselor } from "~/server/utils/counselor";

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  await database
    .delete(pictures)
    .where(and(eq(pictures.user_id, user.id), eq(pictures.id, id)));
  await counselor(`/storage/delete`, {
    method: "DELETE",
    query: { key: `server/picture/${id}` },
  });
  return { message: "删除成功" };
});
