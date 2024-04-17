import { z } from "zod";
import { ObjectId } from "mongodb";
import { rows_collection } from "./index.post";

const request_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, request_schema.parse);
  return rows_collection.find({ _table_id: new ObjectId(_id) }).toArray();
});
