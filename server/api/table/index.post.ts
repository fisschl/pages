import { mongodb } from "~/server/database/mongo";
import { checkUser } from "../auth/index.post";
import { ObjectId } from "mongodb";
import { table_create_schema } from "~/server/api/table/tables";

export const table_collection = mongodb.collection("table");
export const rows_collection = mongodb.collection("rows");
export const columns_collection = mongodb.collection("columns");

export default defineEventHandler(async (event) => {
  const { _id, ...body } = await readValidatedBody(
    event,
    table_create_schema.parse,
  );
  const user = await checkUser(event);
  if (_id) {
    // 增量更新表数据
    const data = {
      ...body,
      create_at: undefined,
      update_at: new Date(),
    };
    return table_collection.findOneAndUpdate(
      { _id: new ObjectId(_id), user_id: user.id },
      { $set: data },
      { returnDocument: "after" },
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
  const columns = Array.from({ length: 20 }).map((item, index) => {
    return {
      _table_id: insertedId,
      title: `C_${index}`,
    };
  });
  await columns_collection.insertMany(columns);
  // 预填充行
  const rows = Array.from({ length: 64 }).map(() => {
    return {
      _table_id: insertedId,
    };
  });
  await rows_collection.insertMany(rows);
  return table;
});
