import { eq } from "drizzle-orm";
import { first } from "lodash-es";
import { db } from "~/server/utils/db";
import { ShortLinkInsertSchema, short_links } from "~/server/utils/schema";
import { shortLinkURL } from "~/utils/shortLinks";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, ShortLinkInsertSchema.parse);
  const item = await Promise.resolve().then(async () => {
    const lastItem = await db.query.short_links.findFirst({
      where: eq(short_links.url, body.url),
    });
    if (lastItem) return lastItem;
    const items = await db.insert(short_links).values(body).returning();
    return first(items);
  });
  return { url: shortLinkURL(item!.id) };
});