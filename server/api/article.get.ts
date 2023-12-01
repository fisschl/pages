import { isString } from "lodash-es";
import { db } from "./user";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  return db.article.findUnique({
    where: { id, users: { some: user }, deleted: false },
  });
});
