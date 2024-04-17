import { checkUser } from "~/server/api/auth/index.post";
import { table_collection } from "~/server/api/table/index.post";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const { _id } = getQuery<Record<string, string>>(event);
  const user = await checkUser(event);
  return table_collection.findOne({
    _id: new ObjectId(_id),
    user_id: user.id,
  });
});
