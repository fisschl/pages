import { ObjectId } from "mongodb";
import { columns_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id, ...body } = await readBody<Record<string, string>>(event);
  if (!_id) {
    // 创建列
    await columns_collection.insertOne(body);
    return body;
  }
  // 更新列
  return columns_collection.findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: body },
  );
});
