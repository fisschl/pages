import { ObjectId } from "mongodb";
import { columns_collection } from "./index.post";
import { z } from "zod";

export const column_schema = z.object({
  _id: z.string(),
  table_id: z.string(),
  title: z.string(),
  type: z.string().optional(),
  width: z.number().optional(),
});

export const column_create_schema = column_schema.partial();

export default defineEventHandler(async (event) => {
  const { _id, table_id, ...body } = await readValidatedBody(
    event,
    column_create_schema.parse,
  );
  if (table_id && !_id) {
    // 创建列
    const column = {
      table_id: new ObjectId(table_id),
      ...body,
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
