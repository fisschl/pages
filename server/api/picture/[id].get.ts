import { Picture } from "~/server/utils/schema";
import { picture_key } from "./index.post";
import { eq } from "drizzle-orm";

export const picture_cdn = (item: Picture) => {
  const key = picture_key(item.id, item.name);
  return `https://cdn.fisschl.world/${key}`;
};

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ status: 400 });
  const picture = await db.query.pictures.findFirst({
    where: eq(pictures.id, id),
  });
  if (!picture) throw createError({ status: 404 });
  return sendRedirect(event, picture_cdn(picture));
});
