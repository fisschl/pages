import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { ShortLinkInsertSchema, short_links } from "~/server/database/schema";
import { database } from "~/server/database/postgres";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, ShortLinkInsertSchema.parse);
  const item = await Promise.resolve().then(async () => {
    const lastItem = await database.query.short_links.findFirst({
      where: eq(short_links.url, body.url),
    });
    if (lastItem) return lastItem;
    const items = await database.insert(short_links).values(body).returning();
    return first(items);
  });
  if (!item) throw createError({ status: 500 });
  return { url: `https://fisschl.world/u/${item.id}` };
});
