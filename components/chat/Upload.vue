<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
const files = defineModel<string[]>("files");

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
    const target_px = 1080;
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
    const webp = canvas.toDataURL("image/webp");
    if (files.value) files.value.push(webp);
    else files.value = [webp];
  }
});
</script>

<template>
  <UButton
    color="sky"
    icon="i-tabler-photo-up"
    variant="soft"
    title="上传图片"
    @click="open"
  />
</template>
