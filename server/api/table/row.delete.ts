import { ObjectId } from "mongodb";
import { rows_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id } = getQuery<Record<string, string>>(event);
  return rows_collection.deleteOne({
    _id: new ObjectId(_id),
  });
});
