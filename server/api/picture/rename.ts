import { z } from "zod";
import { counselor } from "~/server/api/picture/download";
import { db } from "~/server/utils/db";
import { checkUser } from "~/server/utils/password";

const QuerySchema = z.object({
  id: z.string(),
  name: z.string(),
});

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id, name } = await readValidatedBody(event, QuerySchema.parse);
  await db.update(pictures).set({ name, update_at: new Date().toISOString() });
  const filename = encodeURIComponent(name);
  const meta = { "Content-Disposition": `attachment; filename="${filename}"` };
  await counselor(`/storage/update`, {
    method: "PUT",
    body: { key: `server/picture/${id}`, meta },
  });
  return { message: "更新成功" };
});