import { ofetch } from "ofetch";

export const use_oss = async (token?: string) => {
  const res = await ofetch("https://fisschl.world/oss/sts", {
    query: { token },
  });
  const { OSS } = window as any;
  return new OSS({
    region: "oss-cn-shanghai",
    bucket: "fisschl",
    accessKeyId: res.AccessKeyId,
    accessKeySecret: res.AccessKeySecret,
    stsToken: res.SecurityToken,
  });
};

export const upload_file = async (
  token: string,
  key: string,
  file: File,
  progress?: (percent: number) => void,
) => {
  const oss = await use_oss(token);
  const filename = encodeURIComponent(file.name);
  await oss.multipartUpload(key, file, {
    progress: (e: number) => {
      if (!progress) return;
      progress(e * 100);
    },
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};

export const download_file = async (key: string) => {
  const oss = await use_oss();
  const uri = oss.signatureUrl(key);
  window.open(uri);
};

export const delete_file = async (token: string, key: string) => {
  const oss = await use_oss(token);
  await oss.delete(key);
};
