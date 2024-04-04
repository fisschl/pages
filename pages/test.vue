<script setup lang="ts">
const fileSelector = useFileDialog({ accept: "image/*", multiple: true });
fileSelector.onChange(async (files) => {
  if (!files) return;
  for (const file of files) {
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
    const target_px = 512;
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
    const webp = new File([blob], "image.webp", { type: "image/webp" });
  }
});

const send = async () => {
  const res = await $fetch("/api/chat/test");
  console.log(res);
};
</script>

<template>
  <UContainer class="py-4">
    <UButton @click="send"> Hello World </UButton>
  </UContainer>
</template>
