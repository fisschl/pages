import { ObjectId } from "mongodb";
import { rows_collection } from "./index.post";
import { id_schema } from "~/server/api/table/column.delete";

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  return rows_collection.deleteOne({
    _id: new ObjectId(_id),
  });
});
