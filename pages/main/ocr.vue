<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
import { z } from "zod";

const dialog = useFileDialog({
  accept: "image/*",
});

const line_schema = z.object({
  text: z.string(),
});

const image = ref("");
const lines = ref<z.output<typeof line_schema>[]>();

const setFile = async (file: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise<Event>((resolve) => {
    reader.onload = resolve;
  });
  if (typeof reader.result !== "string") return;
  image.value = reader.result;
  const base64String = reader.result.split(",")[1];
  const data = await $fetch("/api/youdao/ocr", {
    method: "POST",
    body: { img: base64String },
  });
  lines.value = z.array(line_schema).parse(data);
};

dialog.onChange(async (list) => {
  if (!list?.length) return;
  const [file] = list;
  await setFile(file);
});

const handleReadClipboard = async () => {
  const list = await navigator.clipboard.read();
  for (const clipboardItem of list) {
    const type = clipboardItem.types.find((type) => type.includes("image/"));
    if (!type) continue;
    const blob = await clipboardItem.getType(type);
    return await setFile(blob);
  }
};
</script>

<template>
  <UContainer class="my-4">
    <div class="mb-6 flex justify-center">
      <UButton
        icon="i-tabler-photo-up"
        variant="soft"
        class="mr-3"
        @click="dialog.open"
      >
        上传图片
      </UButton>
      <UButton
        icon="i-tabler-clipboard-text"
        color="blue"
        variant="soft"
        @click="handleReadClipboard"
      >
        剪贴板识别
      </UButton>
    </div>
    <article class="flex items-start" v-if="image">
      <img :src="image" alt="要识别的图片" class="mr-6" style="width: 45%" />
      <article class="flex-1 overflow-auto">
        <p v-for="item in lines">
          {{ item.text }}
        </p>
      </article>
    </article>
  </UContainer>
</template>

<style module></style>
