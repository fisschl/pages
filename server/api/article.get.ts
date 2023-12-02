import { isString } from "lodash-es";
import { checkUser } from "~/server/api/login";
import { prisma } from "./user";

export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || !isString(id)) throw createError({ status: 400 });
  try {
    const user = await checkUser(event);
    return prisma.article.findUnique({
      where: { id, users: { some: user }, deleted: false },
    });
  } catch {
    const article = await prisma.article.findUnique({
      where: { id, deleted: false },
    });
    if (article?.shared) return article;
    throw createError({ status: 403 });
  }
});
