import { z } from "zod";
import { columns_collection } from "./index.post";
import { ObjectId } from "mongodb";

const request_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, request_schema.parse);
  const list = await columns_collection
    .find({ table_id: new ObjectId(_id) })
    .sort({ order: 1 })
    .toArray();
  return list;
});
