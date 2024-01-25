import { first } from "lodash-es";
import { db } from "~/server/utils/db";
import { ShortLinkInsertSchema, short_links } from "~/server/utils/schema";

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, ShortLinkInsertSchema.parse);
  const res = await db.insert(short_links).values(body).returning();
  const item = first(res);
  return { url: `https://fisschl.world/u/${item?.id}` };
});
