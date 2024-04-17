import { ObjectId } from "mongodb";
import { columns_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id } = getQuery<Record<string, string>>(event);
  return columns_collection.deleteOne({
    _id: new ObjectId(_id),
  });
});
