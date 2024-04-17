import { mongodb } from "~/server/database/mongo";
import { checkUser } from "../auth/index.post";
import { ObjectId } from "mongodb";

export const table_collection = mongodb.collection("table");
export const rows_collection = mongodb.collection("rows");
export const columns_collection = mongodb.collection("columns");

export default defineEventHandler(async (event) => {
  const { _id, ...body } = await readBody<Record<string, string>>(event);
  const user = await checkUser(event);
  if (_id) {
    // 增量更新表数据
    return table_collection.findOneAndUpdate(
      { _id: new ObjectId(_id), user_id: user.id },
      { $set: body },
    );
  }
  // 创建表
  const table = {
    name: body.name || "未命名",
    user_id: user.id,
    create_at: new Date(),
  };
  const { insertedId } = await table_collection.insertOne(table);
  // 预填充列
  const columns = Array.from({ length: 10 }).map((item, index) => {
    return {
      table_id: insertedId,
      title: `C_${index}`,
      type: "单行文本",
    };
  });
  await columns_collection.insertMany(columns);
  // 预填充行
  const rows = Array.from({ length: 64 }).map(() => {
    return {
      table_id: insertedId,
    };
  });
  await rows_collection.insertMany(rows);
  return table;
});
