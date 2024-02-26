import { count, desc, eq } from "drizzle-orm";
import { first } from "lodash-es";
import { limitOffset, PageQuerySchema } from "~/server/database/page";
import { database } from "~/server/database/postgres";
import { pictures } from "~/server/database/schema";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = await getValidatedQuery(event, PageQuerySchema.parse);
  const where = eq(pictures.user_id, user.id);
  const counts = await database
    .select({ total: count() })
    .from(pictures)
    .where(where);
  const list = await database.query.pictures.findMany({
    where,
    ...limitOffset(query),
    orderBy: desc(pictures.update_at),
  });
  return { total: first(counts)?.total, list };
});
