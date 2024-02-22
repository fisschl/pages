import { eq } from "drizzle-orm";
import { z } from "zod";
import { counselor } from "~/server/api/picture/download";
import { checkUser } from "~/server/utils/password";
import { database } from "~/server/database/postgres";

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
  const meta = { "Content-Disposition": `attachment; filename="${filename}"` };
  await counselor(`/storage/update`, {
    method: "PUT",
    body: { key: `server/picture/${id}`, meta },
  });
  return { message: "更新成功" };
});
