import { count, desc, eq } from "drizzle-orm";
import { first } from "lodash-es";
import { db, PageQuerySchema, limitOffset } from "~/server/utils/db";

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
  return { total: first(counts)?.total, list };
});
