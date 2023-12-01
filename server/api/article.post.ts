import { isString } from "lodash-es";
import { checkUser } from "../utils/user";

/**
 * 新增文章
 */
export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name } = await readBody(event);
  if (!name || !isString(name)) throw createError({ status: 400 });
  return db.article.create({
    data: { name, users: { connect: user } },
  });
});
