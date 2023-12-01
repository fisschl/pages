import { isString } from "lodash-es";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  return db.article.update({
    where: { id, users: { some: user }, deleted: false },
    data: { select_time: new Date() },
  });
});
