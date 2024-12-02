<script setup lang="ts">
import { first } from "lodash-es";

const fileDialog = useFileDialog();

interface FileInfo {
  id: string;
  type: string;
  src: string;
  status: "uploading" | "watching" | "success" | "error";
  name: string;
  content: string;
}

const fileInfo = reactive<Partial<FileInfo>>({});
const toast = useToast();

const uploadFile = async (file: File | null | undefined) => {
  if (!file) return;
  fileInfo.type = file.type;
  fileInfo.src = URL.createObjectURL(file);
  fileInfo.status = "uploading";
  fileInfo.name = file.name;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const { id } = await $fetch("/api/moonshot/file-upload", {
      method: "PUT",
      body: formData,
    });
    fileInfo.id = id;
    fileInfo.status = "watching";
  } catch (error) {
    fileInfo.status = "error";
    toast.add({
      title: "上传失败",
      description: `${file.name}：${error}`,
      color: "red",
      icon: "i-tabler-alert-triangle",
    });
    return;
  }
  try {
    const { html } = await $fetch("/api/moonshot/file-content", {
      query: {
        id: fileInfo.id,
      },
    });
    fileInfo.content = html;
    fileInfo.status = "success";
  } catch (error) {
    fileInfo.status = "error";
    toast.add({
      title: "解析失败",
      description: `${file.name}：${error}`,
      color: "red",
      icon: "i-tabler-alert-triangle",
    });
  }
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
      <img
        v-if="fileInfo.type?.includes('image')"
        :src="fileInfo.src"
        :alt="fileInfo.name"
      />
      <UButton icon="i-tabler-upload" block @click="fileDialog.open">
        点击上传
      </UButton>
      <UTextarea
        placeholder="请将图片粘贴，或者拖放到这里"
        @paste="handlePaste"
      />
    </section>
    <section class="markdown flex-1">
      <div
        v-if="fileInfo.status === 'uploading'"
        class="flex items-center gap-2"
      >
        <UIcon
          name="i-tabler-loader-2"
          style="font-size: 20px"
          class="animate-spin"
        />
        <span>正在上传</span>
      </div>
      <div
        v-else-if="fileInfo.status === 'watching'"
        class="flex items-center gap-2"
      >
        <UIcon
          name="i-tabler-loader-2"
          style="font-size: 20px"
          class="animate-spin"
        />
        <span>正在解析</span>
      </div>
      <article
        class="prose mb-2 dark:prose-invert prose-code:text-base"
        v-html="fileInfo.content"
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
