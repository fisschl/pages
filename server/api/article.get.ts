import { Item } from "../utils/zod";

export default defineEventHandler(async (event) => {
  const param = Item.safeParse(getQuery(event));
  if (!param.success) throw createError({ status: 400 });
  const user = await checkUser(event);
  return db.article.findUnique({
    where: { id: param.data.id, users: { some: user } },
  });
});
