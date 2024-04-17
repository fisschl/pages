import { checkUser } from "../auth/index.post";
import { ObjectId } from "mongodb";
import { table_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id } = getQuery<Record<string, string>>(event);
  const user = await checkUser(event);
  return table_collection.deleteOne({
    _id: new ObjectId(_id),
    user_id: user.id,
  });
});
