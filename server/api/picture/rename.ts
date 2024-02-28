import { eq } from "drizzle-orm";
import { z } from "zod";
import { checkUser } from "~/server/utils/password";
import { database } from "~/server/database/postgres";
import { pictures } from "~/server/database/schema";
import { counselor } from "~/server/utils/counselor";

const QuerySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id, name } = await readValidatedBody(event, QuerySchema.parse);
  await database
    .update(pictures)
    .set({ name, update_at: new Date().toISOString() })
    .where(eq(pictures.id, id));
  const filename = encodeURIComponent(name);
  await counselor(`/storage/update`, {
    method: "PUT",
    body: {
      key: `server/picture/${id}`,
      content_disposition: `attachment; filename="${filename}"`,
    },
  });
  return { message: "更新成功" };
});
