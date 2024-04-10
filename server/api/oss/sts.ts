import OSS from "ali-oss";
import { createError, defineEventHandler } from "h3";
import { useUser } from "../auth/index.post";

const { STS } = OSS;
const sts = new STS({
  accessKeyId: process.env.OSS_ACCESS_KEY_ID!,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET!,
});

export default defineEventHandler(async (event) => {
  const user = await useUser(event);
  if (!user) throw createError({ status: 403 });
  const policy = {
    Version: "1",
    Statement: [
      {
        Effect: "Allow",
        Action: ["oss:GetObject", "oss:PutObject"],
        Resource: [`acs:oss:*:*:${process.env.OSS_BUCKET}/home/${user.id}/*`],
      },
    ],
  };
  const result = await sts.assumeRole(
    process.env.OSS_STS_ROLE_ARN!,
    JSON.stringify(policy),
    3000,
    process.env.OSS_SESSION_TOKEN,
  );
  return result.credentials;
});
