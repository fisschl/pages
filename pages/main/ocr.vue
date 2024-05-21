<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
import { z } from "zod";
import { type CSSProperties, reactive } from "vue";

const dialog = useFileDialog({
  accept: "image/*",
});

const line_schema = z.object({
  boundingBox: z.string(),
  text: z.string(),
});

const region_schema = z.object({
  boundingBox: z.string(),
  lines: z.array(line_schema),
});

const image = ref("");

interface Line {
  style: CSSProperties;
  text: string;
}

const lines = ref<Line[]>();

const size = reactive({
  width: 0,
  scale: 1,
});

const setFile = async (file: Blob) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  await new Promise<Event>((resolve) => {
    reader.onload = resolve;
  });
  if (typeof reader.result !== "string") return;
  image.value = reader.result;
  size.width = bar.value!.clientWidth * 0.9;
  const imageElement = new Image();
  imageElement.onload = () => {
    const { naturalWidth } = imageElement;
    size.scale = size.width / naturalWidth;
  };
  imageElement.src = image.value;
  const base64String = reader.result.split(",")[1];
  const data = await $fetch("/api/youdao/ocr", {
    method: "POST",
    body: { img: base64String },
  });
  const regions = z.array(region_schema).parse(data);
  lines.value = regions
    .flatMap((region) => region.lines)
    .map((line) => {
      const numbers = line.boundingBox.split(",");
      const [x1, y1, , , , y3] = numbers.map(Number);
      const height = (y3 - y1) * size.scale;
      const style: CSSProperties = {
        left: `${x1 * size.scale}px`,
        top: `${y1 * size.scale}px`,
        fontSize: `${height * 0.9}px`,
        lineHeight: `${height}px`,
      };
      return {
        text: line.text,
        style,
      } satisfies Line;
    });
};

const bar = ref<HTMLElement>();

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
    <div class="mb-6 flex justify-center" ref="bar">
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
    <article
      v-if="image"
      :style="{ width: size.width + 'px' }"
      class="relative mx-auto overflow-hidden"
    >
      <img
        :src="image"
        alt="要识别的图片"
        class="max-w-none"
        :style="{ width: size.width + 'px' }"
      />
      <section
        class="absolute top-0 h-full w-full bg-gray-800/40 backdrop-blur-sm"
      >
        <p
          v-for="(item, index) in lines"
          :key="index"
          class="absolute text-white"
          :style="item.style"
        >
          {{ item.text }}
        </p>
      </section>
    </article>
  </UContainer>
</template>

<style module></style>
