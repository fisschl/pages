import { checkUser } from "../utils/user";
import { db } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  return db.article.findMany({
    where: {
      users: { some: user },
    },
    select: {
      id: true,
      name: true,
      update_time: true,
    },
    orderBy: { update_time: "desc" },
  });
});
