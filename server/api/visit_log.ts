import { database } from "~/server/database/postgres";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await database.visit_logs.create({
    data: body,
  });
  return { message: "ok" };
});
