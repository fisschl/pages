import { ObjectId } from "mongodb";
import { rows_collection, table_collection } from "./index.post";
import { id_schema } from "~/server/api/table/column.delete";

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  const row = await rows_collection.findOne({
    _id: new ObjectId(_id),
  });
  if (!row) throw createError({ status: 404 });
  await table_collection.updateOne(
    { _id: row._table_id },
    { $set: { update_at: new Date() } },
  );
  return rows_collection.deleteOne({
    _id: new ObjectId(_id),
  });
});
