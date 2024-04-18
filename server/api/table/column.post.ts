import { ObjectId } from "mongodb";
import { columns_collection, table_collection } from "./index.post";
import { z } from "zod";

export const column_schema = z.object({
  _id: z.string(),
  _table_id: z.string(),
  title: z.string(),
  type: z.string().optional(),
  width: z.number().optional(),
  order: z.number().optional(),
});

export const column_create_schema = column_schema.partial();

export default defineEventHandler(async (event) => {
  const { _id, _table_id, ...body } = await readValidatedBody(
    event,
    column_create_schema.parse,
  );
  await table_collection.updateOne(
    { _id: new ObjectId(_table_id) },
    { $set: { update_at: new Date() } },
  );
  if (!_id) {
    // 创建列
    if (!_table_id) throw createError({ status: 400 });
    const column = {
      ...body,
      _table_id: new ObjectId(_table_id),
    };
    await columns_collection.insertOne(column);
    return column;
  }
  // 更新列
  return columns_collection.findOneAndUpdate(
    { _id: new ObjectId(_id) },
    { $set: body },
    { returnDocument: "after" },
  );
});
