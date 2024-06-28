import { z } from "zod";
import { xxhash128 } from "hash-wasm";

const sliceNotExistSchema = z.object({
  url: z.string(),
  status: z.literal("not_exist"),
});

const sliceExistSchema = z.object({
  size: z.number(),
});

export type UploadStatus = "uploading" | "composing" | "success" | "error";

export const useFileUpload = () => {
  const user = useUserStore();

  const uploadThunk = async (blob: Blob) => {
    if (!user.token) throw new Error("token not found");
    const buffer = await blob.arrayBuffer();
    const hash = await xxhash128(new Uint8Array(buffer));
    const sliceResponse = await $fetch("/oss/slice", {
      headers: {
        token: user.token,
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
      return hash;
    }
    const exist = sliceExistSchema.safeParse(sliceResponse);
    if (exist.success) return hash;
    throw new Error("unknown response");
  };

  async function uploadFile(
    file: File,
    progress?: (percent: number, status: UploadStatus) => unknown,
  ) {
    if (!user.token) return;
    const chunkSize = 1024 * 1024;
    const length = Math.ceil(file.size / chunkSize);
    const thunk_list: string[] = [];
    for (let i = 0; i < length; i++) {
      if (progress) progress((i / length) * 100, "uploading");
      const blob = file.slice(
        i * chunkSize,
        Math.min(file.size, (i + 1) * chunkSize),
      );
      const hash = await uploadThunk(blob);
      thunk_list.push(hash);
    }
    if (progress) progress(99, "composing");
    await $fetch("/oss/compose", {
      method: "POST",
      headers: {
        token: user.token,
      },
      query: {
        key: `/${user.info?.id}/${file.name}`,
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
