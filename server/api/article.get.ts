import { isString } from "lodash-es";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = db.article.update({
    where: { id, users: { some: user } },
    data: { update_time: new Date() },
  });
  return res;
});
