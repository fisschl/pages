import { database } from "~/server/database/postgres";
import { z } from "zod";
import { throttle } from "lodash-es";

export const defineBatchInsert = <T>(handler: (items: T[]) => unknown) => {
  const data: T[] = [];
  const insert = throttle(async () => {
    if (!data.length) return;
    const list = data.splice(0, data.length);
    await handler(list);
  }, 3 * 1000);
  return (item: T) => {
    data.push(item);
    insert();
  };
};

const InsertSchema = z.object({
  full_path: z.string(),
  ua: z.string(),
});

type InsertBody = z.infer<typeof InsertSchema>;

const insert = defineBatchInsert(async (items: InsertBody[]) => {
  await database.visit_logs.createMany({
    data: items,
  });
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, InsertSchema.parse);
  insert(body);
  return { message: "ok" };
});
