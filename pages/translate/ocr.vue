<script setup lang="ts">
import { uniqueId } from "lodash-es";

const fileDialog = useFileDialog({
  multiple: true,
});

interface FileInfo {
  id: string;
  type: string;
  src: string;
  status: "loading" | "success" | "error";
  name: string;
}

const fileList = reactive<FileInfo[]>([]);

const uploadFiles = async (files: FileList | null | undefined) => {
  if (!files) return;
  for (const file of files) {
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
      // toast.add({
      //   title: "解析失败",
      //   description: file.name,
      //   color: "red",
      //   icon: "i-tabler-alert-triangle",
      // });
    }
  }
};

const handlePaste = async (e: ClipboardEvent) => {
  if (!e.clipboardData) return;
  const { files } = e.clipboardData;
  if (!files.length) return;
  fileList.length = 0;
  await uploadFiles(files);
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
    <ul class="mb-5">
      <li v-for="item in fileList" :key="item.id" class="space-y-2 px-3 py-2">
        <h4>{{ item.name }}</h4>
        <img
          v-if="item.type.startsWith('image')"
          :src="item.src"
          :alt="item.name"
          style="max-width: 50%"
        />
        <div class="flex items-center">
          <p v-if="item.status === 'loading'">解析中</p>
          <p v-else-if="item.status === 'error'">解析失败</p>
        </div>
      </li>
    </ul>
  </main>
</template>

<style scoped></style>
