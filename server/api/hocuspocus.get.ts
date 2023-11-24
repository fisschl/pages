export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id) throw createError({ status: 401 });
  const item = await prisma.article.findUnique({
    where: { id: id.toString() },
  });
  if (!item) throw createError({ status: 404 });
  return item.body;
});
