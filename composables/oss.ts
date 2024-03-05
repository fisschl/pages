import { ofetch } from "ofetch";
import { useUserStore } from "~/composables/user";
import type ALI_OSS from "ali-oss";
import type { ListObjectResult, ObjectMeta } from "ali-oss";

declare global {
  const OSS: typeof ALI_OSS;
}

export type FileObject = ObjectMeta;

export const useOssStore = defineStore("pages-oss", () => {
  const user = useUserStore();

  const refreshSTSToken = async () => {
    const res = await ofetch<Record<string, string>>(
      "https://bronya.world/oss/sts",
      {
        query: {
          token: user.token || undefined,
        },
      },
    );
    return {
      accessKeyId: res.AccessKeyId,
      accessKeySecret: res.AccessKeySecret,
      stsToken: res.SecurityToken,
    };
  };

  const oss = ref<ALI_OSS>();

  const init = async () => {
    if (oss.value) return;
    const res = await refreshSTSToken();
    const instance = new OSS({
      region: "oss-cn-shanghai",
      bucket: "fisschl",
      ...res,
      refreshSTSToken,
      refreshSTSTokenInterval: 300000,
    });
    oss.value = instance;
  };

  const upload_file = async (
    key: string,
    file: File,
    progress?: (percent: number) => void,
  ) => {
    const filename = encodeURIComponent(file.name);
    await oss.value?.multipartUpload(key, file, {
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

  const download_file = async (key: string) => {
    const uri = oss.value?.signatureUrl(key);
    window.open(uri);
  };

  const delete_file = async (key: string) => {
    await oss.value?.delete(key);
  };

  /**
   * 获取目录下的子目录和文件
   */
  const list_dir = async (prefix: string) => {
    const prefixes: string[] = [];
    const objects: ObjectMeta[] = [];
    let result: ListObjectResult | undefined = undefined;
    while (!result || result.isTruncated) {
      result = await oss.value?.list(
        {
          prefix,
          delimiter: "/",
          "max-keys": 1000,
          marker: result ? result.nextMarker : undefined,
        },
        {},
      );
      if (!result) break;
      if (result.prefixes) prefixes.push(...result.prefixes);
      if (result.objects) objects.push(...result.objects);
    }
    console.log(prefixes, objects);
    return { prefixes, objects };
  };

  return {
    init,
    upload_file,
    download_file,
    delete_file,
    list_dir,
  };
});

export const baseName = (path: string) => {
  const index = path.lastIndexOf("/");
  return path.slice(index);
};
