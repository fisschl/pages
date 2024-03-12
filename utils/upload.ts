import OSS from "ali-oss";

export const refreshSTSToken = async () => {
  const res = await $fetch("/api/oss/sts");
  return {
    accessKeyId: res.AccessKeyId,
    accessKeySecret: res.AccessKeySecret,
    stsToken: res.SecurityToken,
  };
};

declare global {
  interface Window {
    oss?: OSS;
  }
}

export const upload_file = async (
  key: string,
  file: File,
  progress?: (p: number) => void,
) => {
  if (!window.oss) {
    const res = await refreshSTSToken();
    window.oss = new OSS({
      region: "oss-cn-shanghai",
      bucket: "fisschl",
      ...res,
      refreshSTSToken,
      refreshSTSTokenInterval: 300000,
    });
  }
  const filename = encodeURIComponent(file.name);
  await window.oss.multipartUpload(key, file, {
    progress: (e) => {
      if (!progress) return;
      progress(e * 100);
    },
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
