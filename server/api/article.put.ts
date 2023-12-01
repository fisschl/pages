import { checkUser } from "../utils/user";
import type { article } from "@prisma/client";
import { db } from "./user";

export default defineEventHandler(async (event) => {
  const param: Partial<article> = await readBody(event);
  if (!param.id) throw createError({ status: 400 });
  const user = await checkUser(event);
  return db.article.update({
    where: { id: param.id, users: { some: user }, deleted: false },
    data: { ...param },
  });
});
