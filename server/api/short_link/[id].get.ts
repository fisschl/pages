import { eq } from "drizzle-orm";
import { short_links } from "~/server/database/schema";
import { database } from "~/server/database/postgres";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ status: 400 });
  const res = await database.query.short_links.findFirst({
    where: eq(short_links.id, id),
  });
  if (!res) throw createError({ status: 404 });
  return sendRedirect(event, res.url);
});
