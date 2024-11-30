<script setup lang="ts">
import { first, uniqueId } from "lodash-es";

const fileDialog = useFileDialog();

interface FileInfo {
  id: string;
  type: string;
  src: string;
  status: "loading" | "success" | "error";
  name: string;
}

const fileInfo = ref<FileInfo>();
const toast = useToast();

const uploadFile = async (file: File | null | undefined) => {
  if (!file) return;
  const fileItem = reactive<FileInfo>({
    id: uniqueId("file_"),
    type: file.type,
    src: URL.createObjectURL(file),
    status: "loading",
    name: file.name,
  });
  const formData = new FormData();
  formData.append("file", file);
  try {
    const { id } = await $fetch("/api/moonshot/file-upload", {
      method: "PUT",
      body: formData,
    });
    fileItem.status = "success";
    fileItem.id = id;
  } catch (error) {
    console.error(error);
    fileItem.status = "error";
    toast.add({
      title: "解析失败",
      description: file.name,
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
  <main class="px-3 pb-7 pt-4">
    <section class="mb-5 flex flex-1 flex-col gap-3">
      <UButton icon="i-tabler-upload" block @click="fileDialog.open">
        点击上传
      </UButton>
      <UTextarea
        placeholder="请将图片粘贴，或者拖放到这里"
        @paste="handlePaste"
      />
    </section>
    <section v-if="fileInfo">
      <h4>{{ fileInfo.name }}</h4>
      <img
        v-if="fileInfo.type.startsWith('image')"
        :src="fileInfo.src"
        :alt="fileInfo.name"
        style="max-width: 50%"
      />
      <div class="flex items-center">
        <p v-if="fileInfo.status === 'loading'">解析中</p>
        <p v-else-if="fileInfo.status === 'error'">解析失败</p>
      </div>
    </section>
  </main>
</template>

<style scoped></style>
