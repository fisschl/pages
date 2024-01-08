import OSS from "ali-oss";

const { OSS_REGION, OSS_ACCESSKEY_ID, OSS_ACCESSKEY_SECRET, OSS_BUCKET } =
  process.env;

export const oss = new OSS({
  region: OSS_REGION,
  accessKeyId: OSS_ACCESSKEY_ID!,
  accessKeySecret: OSS_ACCESSKEY_SECRET!,
  bucket: OSS_BUCKET,
  secure: true,
});
