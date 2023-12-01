import { isString } from "lodash-es";
import { prisma } from "./user";
import { checkUser } from "~/server/api/login";

/**
 * 新增文章
 */
export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const { name } = await readBody(event);
  if (!name || !isString(name)) throw createError({ status: 400 });
  return prisma.article.create({
    data: {
      name,
      users: { connect: user },
      body: "法律不容藐视，它自会证明它的价值。",
    },
  });
});
