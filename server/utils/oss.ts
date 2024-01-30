import OSS from "ali-oss";
import sharp from "sharp";

const { OSS_REGION, OSS_ACCESSKEY_ID, OSS_ACCESSKEY_SECRET, OSS_BUCKET } =
  process.env;

export const oss = new OSS({
  region: OSS_REGION,
  accessKeyId: OSS_ACCESSKEY_ID!,
  accessKeySecret: OSS_ACCESSKEY_SECRET!,
  bucket: OSS_BUCKET,
  secure: true,
});

export const toWebp = async (KEY: string) => {
  const { content } = await oss.get(KEY);
  const result = await sharp(content).webp().toBuffer();
  await oss.put(KEY, result, {
    headers: { "content-type": "image/webp" },
  });
};
