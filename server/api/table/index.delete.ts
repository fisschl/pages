import { checkUser } from "../auth/index.post";
import { ObjectId } from "mongodb";
import {
  columns_collection,
  rows_collection,
  table_collection,
} from "./index.post";
import { id_schema } from "~/server/api/table/column.delete";

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  const user = await checkUser(event);
  await columns_collection.deleteMany({
    _table_id: new ObjectId(_id),
  });
  await rows_collection.deleteMany({
    _table_id: new ObjectId(_id),
  });
  return table_collection.deleteOne({
    _id: new ObjectId(_id),
    user_id: user.id,
  });
});
