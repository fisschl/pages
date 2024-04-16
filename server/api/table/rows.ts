import { z } from "zod";
import { ObjectId } from "mongodb";
import { rows_collection } from "./index.post";

const request_schema = z.object({
  _id: z.string(),
});

export default defineEventHandler(async (event) => {
  const { _id } = await getValidatedQuery(event, request_schema.parse);
  const list = await rows_collection
    .find({ table_id: new ObjectId(_id) })
    .toArray();
  return list;
});
