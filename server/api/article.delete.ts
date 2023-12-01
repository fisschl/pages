import { isString, throttle } from "lodash-es";

export const syncArticle = throttle(async () => {}, 10 * 1000);

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.update({
    where: { id, users: { some: user } },
    data: { deleted: true },
  });
  syncArticle();
  return res;
});
