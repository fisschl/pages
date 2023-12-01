import { isString } from "lodash-es";
import { checkUser } from "~/server/api/login";
import { prisma } from "./user";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  const user = await checkUser(event);
  return prisma.article.findUnique({
    where: { id, users: { some: user }, deleted: false },
  });
});
