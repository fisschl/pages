import { eq } from "drizzle-orm";
import { z } from "zod";
import { pictures } from "~/server/database/schema";
import { database } from "~/server/database/postgres";
import { counselor } from "~/server/utils/counselor";

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  // 下载文件，需要指定下载文件名
  const picture = await database.query.pictures.findFirst({
    where: eq(pictures.id, id),
  });
  if (!picture) throw createError({ status: 404 });
  const { url } = await counselor(`/storage/download`, {
    query: { key: `server/picture/${id}`, name: picture.name },
  });
  return sendRedirect(event, url);
});
