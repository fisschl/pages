export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 401 });
  await prisma.article.delete({
    where: { id },
  });
  return true;
});
