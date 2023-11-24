import { omit } from "lodash-es";
import { checkUser } from "../utils/user";

/**
 * 新增文章
 */
export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name } = await readBody(event);
  if (!name) throw createError({ status: 400 });
  const item = await prisma.article.create({
    data: {
      name,
      body: Buffer.from(""),
      users: { connect: user },
    },
  });
  return omit(item, "body");
});
