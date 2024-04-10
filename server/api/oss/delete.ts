import { createError, defineEventHandler, getQuery } from "h3";
import { oss } from "./download";
import { useUser } from "../auth/index.post";

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event);
  if (!key || typeof key !== "string") throw createError({ status: 400 });
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  if (!key.startsWith(`home/${user.id}`)) throw createError({ status: 403 });
  await oss.delete(key);
  return { message: "删除成功" };
});
