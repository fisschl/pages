import { checkUser } from "../auth/index.post";
import { table_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  return table_collection
    .find({ user_id: user.id })
    .sort({ create_at: -1 })
    .toArray();
});
