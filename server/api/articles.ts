import { checkUser } from "../utils/user";
import { db } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  return db.article.findMany({
    where: {
      users: { some: user },
    },
    select: {
      body: false,
    },
    orderBy: { select_time: "desc" },
  });
});
