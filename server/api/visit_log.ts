import { database } from "~/server/database/postgres";
import { throttle } from "lodash-es";
import { z } from "zod";

const InsertSchema = z.object({
  full_path: z.string(),
  ua: z.string(),
});

type InsertBody = z.infer<typeof InsertSchema>;

const data: InsertBody[] = [];

const insert = throttle(async () => {
  const list = data.splice(0, data.length);
  await database.visit_logs.createMany({
    data: list,
  });
}, 3 * 1000);

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, InsertSchema.parse);
  data.push(body);
  insert();
  return { message: "ok" };
});
