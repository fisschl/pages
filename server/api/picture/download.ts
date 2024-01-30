import { eq } from "drizzle-orm";
import { z } from "zod";

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  const KEY = `server/picture/${id}`;
  // 下载文件，需要指定下载文件名
  const picture = await db.query.pictures.findFirst({
    where: eq(pictures.id, id),
  });
  if (!picture) throw createError({ status: 404 });
  const NAME = encodeURIComponent(picture.name);
  const URL = oss.signatureUrl(KEY, {
    response: {
      "content-disposition": `attachment; filename=${NAME}`,
    },
  });
  return sendRedirect(event, URL);
});
