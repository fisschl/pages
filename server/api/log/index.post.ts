import { writeLog } from "~/server/utils/log";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  await writeLog(body);
  return { message: "成功" };
});
