import { checkUser } from "../auth/index.post";
import { table_collection } from "./index.post";
import { z } from "zod";

export const table_schema = z.object({
  _id: z.string(),
  user_id: z.string(),
  name: z.string(),
  create_at: z.string(),
});

export const table_create_schema = table_schema.partial();

export type Table = z.output<typeof table_schema>;

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  return table_collection
    .find({ user_id: user.id })
    .sort({ create_at: -1 })
    .toArray();
});
