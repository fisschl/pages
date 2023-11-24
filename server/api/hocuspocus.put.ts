export default defineEventHandler(async (event) => {
  const { id } = getQuery(event);
  if (!id || typeof id !== "string") throw createError({ status: 401 });
  const body = await readRawBody(event, false);
  await prisma.article.update({
    where: { id },
    data: { body },
  });
  return true;
});
