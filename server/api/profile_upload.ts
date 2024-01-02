import OSS from "ali-oss";
import { checkUser } from "~/server/api/session.post";
import { z } from "zod";
import { prisma, redis } from "~/server/api/user.get";

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

export const profileKey = (userId: string, name: string) => {
  return `server/profile/${userId}/${name}`;
};

export default defineEventHandler(async (event) => {
  const { id, token } = await checkUser(event);
  const query = getQuery(event);
  const { name, type } = QuerySchema.parse(query);
  const url = oss.signatureUrl(profileKey(id, name), {
    method: "PUT",
    "Content-Type": type,
  });
  const user = await prisma.user.update({
    where: { id },
    data: { profile: name },
  });
  await redis.json.set(token, "$", user);
  return { url };
});
