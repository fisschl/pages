export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 401 });
  const item = await prisma.article.findUnique({
    where: { id },
  });
  if (!item) throw createError({ status: 404 });
  return item.body;
});