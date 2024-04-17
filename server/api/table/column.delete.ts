import { ObjectId } from "mongodb";
import { columns_collection } from "./index.post";
import { z } from "zod";

export const id_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, id_schema.parse);
  return columns_collection.deleteOne({
    _id: new ObjectId(_id),
  });
});
