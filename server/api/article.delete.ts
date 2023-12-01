import { isString } from "lodash-es";
import { db } from "./user";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  return db.article.update({
    where: { id, users: { some: user } },
    data: { deleted: true },
  });
});
