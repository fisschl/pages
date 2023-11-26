import { omit } from "lodash-es";
import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  const { id, name } = await readBody(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  const user = await checkUser(event);
  const res = await db.article.update({
    where: {
      id,
      users: { some: user },
    },
    data: { name: name || undefined },
  });
  return omit(res, "body");
});
