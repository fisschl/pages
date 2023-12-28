import OSS from "ali-oss";
import { checkUser } from "~/server/api/session.post";
import { z } from "zod";

export const oss = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESSKEY_ID!,
  accessKeySecret: process.env.OSS_ACCESSKEY_SECRET!,
  bucket: process.env.OSS_BUCKET,
  secure: true,
});

const QuerySchema = z.object({
  name: z.string(),
  type: z.string(),
});

export default defineEventHandler(async (event) => {
  const user = await checkUser(event);
  const query = getQuery(event);
  const { name, type } = QuerySchema.parse(query);
  const url = oss.signatureUrl(`server/profile/${user.id}/${name}`, {
    method: "PUT",
    "Content-Type": type,
  });
  return { url };
});
