import process from "node:process";
import { ofetch } from "ofetch";
import { database } from "~/server/database/postgres";

const { MOONSHOT_API_KEY } = process.env;

export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);
  formData.append("purpose", "file-extract");
  const result = await ofetch("https://api.moonshot.cn/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MOONSHOT_API_KEY}`,
    },
    body: formData,
  });
  return database.moonshot_files.create({
    data: {
      id: result.id,
      bytes: result.bytes,
      filename: result.filename,
      created_at: new Date(result.created_at * 1000),
    },
  });
});
