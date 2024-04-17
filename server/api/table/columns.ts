import { columns_collection } from "./index.post";
import { ObjectId } from "mongodb";
import { id_schema } from "~/server/api/table/column.delete";

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  return columns_collection
    .find({ table_id: new ObjectId(_id) })
    .sort({ order: 1 })
    .toArray();
});
