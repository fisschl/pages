import { eq } from "drizzle-orm";
import { z } from "zod";
import { ofetch } from "ofetch";

export const counselor = ofetch.create({
  baseURL: process.env.COUNSELOR_HOST,
});

const QuerySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await getValidatedQuery(event, QuerySchema.parse);
  // 下载文件，需要指定下载文件名
  const picture = await db.query.pictures.findFirst({
    where: eq(pictures.id, id),
  });
  if (!picture) throw createError({ status: 404 });
  const { url } = await counselor(`/storage/download`, {
    query: { key: `server/picture/${id}`, name: picture.name },
  });
  return sendRedirect(event, url);
});
