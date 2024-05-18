import { createError, defineEventHandler, getQuery } from "h3";
import { use401 } from "~/server/utils/user";
import { oss } from "./download";

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event);
  if (!key || typeof key !== "string") throw createError({ status: 400 });
  const user = await use401(event);
  if (!user) throw createError({ status: 403 });
  if (!key.startsWith(`home/${user}`)) throw createError({ status: 403 });
  await oss.delete(key);
  return { message: "删除成功" };
});
