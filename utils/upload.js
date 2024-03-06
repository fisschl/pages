import { ofetch } from "ofetch";
import { useUserStore } from "~/composables/user";

const refreshSTSToken = async () => {
  const user = useUserStore();
  const res = await ofetch("https://bronya.world/oss/sts", {
    headers: {
      token: user.token || undefined,
    },
  });
  return {
    accessKeyId: res.AccessKeyId,
    accessKeySecret: res.AccessKeySecret,
    stsToken: res.SecurityToken,
  };
};

let oss;

export const upload_file = async (key, file, progress) => {
  if (!oss) {
    const res = await refreshSTSToken();
    // eslint-disable-next-line no-undef
    oss = new OSS({
      region: "oss-cn-shanghai",
      bucket: "fisschl",
      ...res,
      refreshSTSToken,
      refreshSTSTokenInterval: 300000,
    });
  }
  const filename = encodeURIComponent(file.name);
  await oss.multipartUpload(key, file, {
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
