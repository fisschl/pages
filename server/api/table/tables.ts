import { checkUser } from "../auth/index.post";
import { table_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const result = await table_collection
    .find({
      user_id: user.id,
    })
    .sort({
      create_at: -1,
    })
    .toArray();
  return result;
});
