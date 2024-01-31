import { eq } from "drizzle-orm";
import { basename, extname } from "node:path";
import { z } from "zod";
import { db } from "~/server/utils/db";
import { toWebp } from "~/server/utils/oss";

const BodySchema = z.object({
  id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { id } = await readValidatedBody(event, BodySchema.parse);
  const item = await db.query.pictures.findFirst({
    where: eq(pictures.id, id),
  });
  if (!item) throw createError({ status: 404 });
  if (item.content_type === "image/webp") return { message: "No Change" };
  await toWebp(`server/picture/${item.id}`);
  const { name } = item;
  await db
    .update(pictures)
    .set({
      name: basename(name, extname(name)) + ".webp",
      content_type: "image/webp",
    })
    .where(eq(pictures.id, item.id));
  return { message: "ok" };
});
