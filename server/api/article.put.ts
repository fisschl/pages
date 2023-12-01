import type { article } from "@prisma/client";
import { prisma } from "./user";
import { checkUser } from "~/server/api/login";

export default defineEventHandler(async (event) => {
  const param: Partial<article> = await readBody(event);
  if (!param.id) throw createError({ status: 400 });
  const user = await checkUser(event);
  return prisma.article.update({
    where: { id: param.id, users: { some: user }, deleted: false },
    data: { ...param },
  });
});
