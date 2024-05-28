const refreshSTSToken = async () => {
  const res = await $fetch("/api/oss/sts");
  return {
    accessKeyId: res.AccessKeyId,
    accessKeySecret: res.AccessKeySecret,
    stsToken: res.SecurityToken,
  };
};

export const upload_file = async (key, file, progress) => {
  if (!window.oss) {
    const res = await refreshSTSToken();
    window.oss = new window.OSS({
      region: "oss-cn-shanghai",
      bucket: "fisschl",
      ...res,
      refreshSTSToken,
      refreshSTSTokenInterval: 300000,
      secure: true,
    });
  }
  const filename = encodeURIComponent(file.name);
  await window.oss.multipartUpload(key, file, {
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
