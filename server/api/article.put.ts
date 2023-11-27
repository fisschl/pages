import { omit } from "lodash-es";
import { checkUser } from "../utils/user";
import { z } from "zod";
import { Item } from "../utils/zod";

const Article = Item.extend({
  name: z.string().optional(),
});

export default defineEventHandler(async (event) => {
  const param = Article.safeParse(await readBody(event));
  if (!param.success) throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.update({
    where: {
      id: param.data.id,
      users: { some: user },
    },
    data: { name: param.data.name },
  });
  return omit(res, "body");
});
