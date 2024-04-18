import { ObjectId } from "mongodb";
import { rows_collection, table_collection } from "./index.post";

export default defineEventHandler(async (event) => {
  const { _id, _table_id, ...body } =
    await readBody<Record<string, string>>(event);
  await table_collection.updateOne(
    { _id: new ObjectId(_table_id) },
    { $set: { update_at: new Date() } },
  );
  if (!_id) {
    // 创建行
    if (!_table_id) throw createError({ status: 400 });
    const row = {
      ...body,
      _table_id: new ObjectId(_table_id),
    };
    await rows_collection.insertOne(row);
    return row;
  }
  // 更新行
  return rows_collection.findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: body },
    { returnDocument: "after" },
  );
});
