import { checkUser } from "~/server/api/auth/index.post";
import { table_collection } from "~/server/api/table/index.post";
import { ObjectId } from "mongodb";
import { id_schema } from "~/server/api/table/column.delete";

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  const user = await checkUser(event);
  return table_collection.findOne({
    _id: new ObjectId(_id),
    user_id: user.id,
  });
});
