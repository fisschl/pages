import { z } from "zod";
import { mongodb } from "~/server/database/mongo";
import { checkUser } from "../auth/index.post";

const request_schema = z.object({
  name: z.string(),
});

export const table_collection = mongodb.collection("table");
export const rows_collection = mongodb.collection("rows");
export const columns_collection = mongodb.collection("columns");

export default defineEventHandler(async (event) => {
  const { name } = await readValidatedBody(event, request_schema.parse);
  const user = await checkUser(event);
  const table = {
    name,
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
