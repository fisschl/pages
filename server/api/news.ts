import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(() => {
  return prisma.news.findMany({
    take: 1000,
  });
});
