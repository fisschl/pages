export default defineEventHandler(async (event) => {
  const { name } = await readBody(event);
  if (!name) throw createError({ status: 401 });
  const item = await prisma.article.create({
    data: {
      name,
      body: Buffer.from(""),
    },
  });
  return item;
});
