<script setup lang="ts">
import { first } from "lodash-es";
import { v7 as uuid } from "uuid";

const fileDialog = useFileDialog({
  accept: "image/*",
});

interface FileInfo {
  key: string;
  src: string;
  name: string;
}

const fileInfo = reactive<Partial<FileInfo>>({});

const loading = ref(false);

const ocr_url = computed(() => {
  if (typeof window === "undefined") return;
  const scheme = location.protocol.startsWith("https") ? "wss" : "ws";
  return `${scheme}://${location.host}/api/ocr`;
});

const articleElement = useTemplateRef<HTMLElement>("article-element");

const { send } = useWebSocket(ocr_url, {
  async onMessage(ws, { data }) {
    if (!data) return;
    const response = JSON.parse(data);
    const { key, text, finished } = response;
    if (key !== fileInfo.key) return;
    if (finished) loading.value = false;
    const article = articleElement.value;
    if (!article || !text) return;
    const { update } = await import("~/utils/snabbdom");
    update(article, text);
  },
  autoReconnect: true,
});

const uploadFile = async (file: File | null | undefined) => {
  if (!file) return;
  fileInfo.name = file.name;
  fileInfo.src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const { result } = reader;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      resolve(result);
    };
    reader.readAsDataURL(file);
  });
  fileInfo.key = uuid();
  send(
    JSON.stringify({
      key: fileInfo.key,
      image_url: fileInfo.src,
    }),
  );
};

fileDialog.onChange(async (files) => {
  await uploadFile(first(files));
});

const handlePaste = async (e: ClipboardEvent) => {
  if (!e.clipboardData) return;
  const { files } = e.clipboardData;
  if (!files.length) return;
  await uploadFile(first(files));
};
</script>

<template>
  <main class="flex px-4 pb-7 pt-4">
    <section class="mb-5 mr-6 flex flex-1 flex-col gap-4">
      <img v-if="fileInfo.src" :src="fileInfo.src" :alt="fileInfo.name" />
      <UButton icon="i-tabler-upload" block @click="fileDialog.open">
        点击上传
      </UButton>
      <UTextarea
        placeholder="请将图片粘贴，或者拖放到这里"
        @paste="handlePaste"
      />
    </section>
    <section class="markdown min-w-0 flex-1">
      <article
        ref="article-element"
        class="prose mb-2 dark:prose-invert prose-code:text-base"
      />
      <UIcon
        v-if="loading"
        name="i-tabler-loader-2"
        style="font-size: 20px"
        class="animate-spin"
      />
    </section>
  </main>
</template>

<style scoped>
.markdown :deep(.prose) {
  max-width: none;
}
.markdown :deep(.prose:focus) {
  outline: none;
}
.markdown :deep(code) {
  font-family: "Fira Code Variable", "Noto Sans SC Variable", monospace;
}
</style>
