import { database } from "~/server/database/postgres";
import { use401 } from "~/server/utils/user";

export default defineEventHandler(async (event) => {
  const id = await use401(event);
  return database.user.update({
    where: { id },
    data: { last_login: new Date() },
  });
});
