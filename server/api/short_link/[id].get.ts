import { eq } from "drizzle-orm";
import { db } from "~/server/utils/db";
import { short_links } from "~/server/utils/schema";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ status: 400 });
  const res = await db.query.short_links.findFirst({
    where: eq(short_links.id, id),
  });
  if (!res) throw createError({ status: 404 });
  return sendRedirect(event, res.url, 301);
});
