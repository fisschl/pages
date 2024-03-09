import { createError, defineEventHandler, getQuery, sendRedirect } from "h3";
import OSS from "ali-oss";

export const oss = new OSS({
  region: "oss-cn-shanghai",
  bucket: "fisschl",
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
});

export default defineEventHandler(async (event) => {
  const { key } = getQuery(event);
  if (!key || typeof key !== "string") throw createError({ status: 400 });
  const uri = oss.signatureUrl(key);
  return sendRedirect(event, uri);
});
