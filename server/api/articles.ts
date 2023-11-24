import { omit } from "lodash-es";
import { checkUser } from "../utils/user";
import "../utils/hocuspocus";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const list = await prisma.article.findMany({
    where: {
      users: { some: user },
    },
  });
  return list.map((item) => {
    return omit(item, "body");
  });
});
