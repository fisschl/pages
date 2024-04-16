<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
import { nanoid } from "nanoid";
import { join, parse } from "pathe";

const files = defineModel<string[]>("files");

const user = useUserStore();
const prefix = `home/${user.user?.id}/chat`;

const { open, onChange } = useFileDialog({
  accept: "image/*",
  multiple: true,
  reset: true,
});
onChange(async (list) => {
  if (!list?.length) return;
  for (const file of list) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise<Event>((resolve) => {
      reader.onload = resolve;
    });
    const { result: data_url } = reader;
    if (typeof data_url !== "string") continue;
    const image = new Image();
    image.src = data_url;
    await new Promise<Event>((resolve) => {
      image.onload = resolve;
    });
    const canvas = document.createElement("canvas");
    const target_px = 720;
    // 如果图片的长和宽都小于 target_px 像素，那么 scale 将会是 1，这意味着图片不会被缩放。
    const scale = Math.max(
      image.width / target_px,
      image.height / target_px,
      1,
    );
    const width = image.width / scale;
    const height = image.height / scale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(blob);
      }, "image/webp");
    });
    const parseName = parse(file.name);
    const webp = new File(
      [blob],
      parseName.name.slice(0, 8) + "_" + nanoid(16) + ".webp",
      { type: "image/webp" },
    );
    const key = join(prefix, webp.name);
    await $fetch("/api/chat/file", {
      method: "POST",
      body: { key },
    });
    const { upload_file } = await import("~/utils/upload");
    await upload_file(key, webp);
    if (!files.value) files.value = [];
    await nextTick();
    files.value.push(key);
  }
});
</script>

<template>
  <UButton color="sky" icon="i-tabler-photo-up" variant="soft" @click="open" />
</template>
