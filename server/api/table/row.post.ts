import { ObjectId } from "mongodb";
import { rows_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id, ...body } = await readBody<Record<string, string>>(event);
  if (!_id) {
    // 创建行
    await rows_collection.insertOne(body);
    return body;
  }
  // 更新行
  return rows_collection.findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: body },
  );
});
