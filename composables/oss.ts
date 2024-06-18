import { z } from "zod";
import { base58 } from "@scure/base";

const sliceNotExistSchema = z.object({
  url: z.string(),
  status: z.literal("not_exist"),
});

const sliceExistSchema = z.object({
  size: z.number(),
});

async function calculateHash(arrayBuffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const bytes = new Uint8Array(hashBuffer);
  return base58.encode(bytes);
}

export type UploadStatus = "uploading" | "composing" | "success" | "error";

export const useFileUpload = () => {
  const token = useCookie("token");
  const user = useUserStore();

  async function uploadFile(
    file: File,
    progress?: (percent: number, status: UploadStatus) => unknown,
  ) {
    if (!token.value) return;
    const chunkSize = 1024 * 1024;
    const length = Math.ceil(file.size / chunkSize);
    const thunk_list: string[] = [];
    for (let i = 0; i < length; i++) {
      if (progress) progress((i / length) * 100, "uploading");
      const blob = file.slice(
        i * chunkSize,
        Math.min(file.size, (i + 1) * chunkSize),
      );
      const reader = new FileReader();
      const buffer = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result);
        reader.readAsArrayBuffer(blob);
      });
      if (!(buffer instanceof ArrayBuffer)) throw new Error("not array buffer");
      const hash = await calculateHash(buffer);
      thunk_list.push(hash);
      const sliceResponse = await $fetch("/oss/slice", {
        headers: {
          token: token.value,
        },
        query: {
          slice: hash,
        },
        baseURL: "https://bronya.world",
      });
      const notExist = sliceNotExistSchema.safeParse(sliceResponse);
      if (notExist.success) {
        await $fetch(notExist.data.url, {
          method: "PUT",
          body: blob,
        });
        continue;
      }
      const exist = sliceExistSchema.safeParse(sliceResponse);
      if (exist.success) continue;
      throw new Error("unknown response");
    }
    if (progress) progress(99, "composing");
    await $fetch("/oss/compose", {
      method: "POST",
      headers: {
        token: token.value,
      },
      query: {
        key: `/${user.user?.id}/${file.name}`,
      },
      body: {
        list: thunk_list,
        type: file.type,
      },
      baseURL: "https://bronya.world",
    });
    if (progress) progress(100, "success");
  }

  return { uploadFile };
};
