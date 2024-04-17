import { ObjectId } from "mongodb";
import { columns_collection, rows_collection } from "./index.post";
import { z } from "zod";

export const id_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  const column = await columns_collection.findOne({
    _id: new ObjectId(_id),
  });
  if (!column) throw createError({ status: 404 });
  await rows_collection.updateMany(
    { table_id: column._id },
    { $unset: { [_id]: true } },
  );
  return columns_collection.deleteOne({
    _id: column._id,
  });
});
