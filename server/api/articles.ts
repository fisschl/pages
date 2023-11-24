import { checkUser } from "../utils/user";

export default defineEventHandler(async (event) => {
  await checkUser(event);
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 400 });
  await prisma.article.delete({
    where: { id },
  });
  return true;
});
