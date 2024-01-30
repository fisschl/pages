import { count, desc, eq } from "drizzle-orm";
import { first } from "lodash-es";
import { db, PageQuerySchema, limitOffset } from "~/server/utils/db";
import { basename, extname } from "node:path";
import { Picture } from "~/server/utils/schema";

const pictureToWebp = async (item: Picture) => {
  await toWebp(`server/picture/${item.id}`);
  const { name } = item;
  await db
    .update(pictures)
    .set({
      name: basename(name, extname(name)) + ".webp",
      content_type: "image/webp",
    })
    .where(eq(pictures.id, item.id));
};

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = await getValidatedQuery(event, PageQuerySchema.parse);
  const where = eq(pictures.user_id, user.id);
  const counts = await db
    .select({ total: count() })
    .from(pictures)
    .where(where);
  const list = await db.query.pictures.findMany({
    where,
    ...limitOffset(query),
    orderBy: desc(pictures.update_at),
  });
  list
    .filter((item) => item.content_type !== "image/webp")
    .forEach(pictureToWebp);
  return { total: first(counts)?.total, list };
});
