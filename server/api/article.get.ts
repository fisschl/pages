import { omit } from "lodash-es";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.findUnique({
    where: { id, users: { some: user } },
  });
  return omit(res, "body");
});
