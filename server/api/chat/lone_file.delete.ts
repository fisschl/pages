import { database } from "~/server/database/postgres";
import { oss } from "../oss/download";

export default defineEventHandler(async () => {
  const list = await database.chat_file.findMany({
    where: { ai_chat: { none: {} } },
  });
  for (const item of list) {
    await oss.delete(item.key);
    await database.chat_file.delete({ where: { key: item.key } });
  }
  return list;
});
