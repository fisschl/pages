import { omit } from "lodash-es";
import { checkUser } from "../utils/user";
import type { article } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const param: Partial<article> = await readBody(event);
  if (!param.id) throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.update({
    where: {
      id: param.id,
      users: { some: user },
    },
    data: omit(param, "id"),
  });
  return !!res;
});
