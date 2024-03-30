import OSS from "ali-oss";

export const refreshSTSToken = async () => {
  const res = await $fetch("/api/oss/sts");
  return {
    accessKeyId: res.AccessKeyId,
    accessKeySecret: res.AccessKeySecret,
    stsToken: res.SecurityToken,
  };
};

const oss = ref<OSS>();

export const upload_file = async (
  key: string,
  file: File,
  progress?: (p: number) => void,
) => {
  if (!oss.value) {
    const res = await refreshSTSToken();
    oss.value = new OSS({
      region: "oss-cn-shanghai",
      bucket: "fisschl",
      ...res,
      refreshSTSToken,
      refreshSTSTokenInterval: 300000,
    });
  }
  const filename = encodeURIComponent(file.name);
  await oss.value.multipartUpload(key, file, {
    progress: (...params) => {
      if (!progress) return;
      progress(params[0] * 100);
    },
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
};
