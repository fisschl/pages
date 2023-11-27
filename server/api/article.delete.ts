import { omit } from "lodash-es";
import { Item } from "../utils/zod";

export default defineEventHandler(async (event) => {
  const param = Item.safeParse(getQuery(event));
  if (!param.success) throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.delete({
    where: {
      id: param.data.id,
      users: { some: user },
    },
  });
  return omit(res, "body");
});
