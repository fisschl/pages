import { isString } from "lodash-es";
import { prisma } from "./user";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  if (!isString(query.skip)) query.skip = "0";
  return prisma.chat.findMany({
    skip: parseInt(query.skip) || 0,
    take: 20,
    orderBy: { create_time: "desc" },
  });
});
