import { z } from "zod";
import { database } from "~/server/database/postgres";

const InsertSchema = z.object({
  full_path: z.string(),
  ua: z.string(),
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, InsertSchema.parse);
  await database.visit_logs.create({
    data: body,
  });
  return { message: "ok" };
});
