import { omit } from "lodash-es";
import { checkUser } from "../utils/user";
import { db } from "~/server/utils/db";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const list = await db.article.findMany({
    where: {
      users: { some: user },
    },
    orderBy: { update_time: "desc" },
  });
  return list.map((item) => {
    return omit(item, "body");
  });
});
