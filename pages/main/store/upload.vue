<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";
import { join } from "pathe";
import { isString } from "lodash-es";

const route = useRoute();
const formData = reactive({
  path: String(route.query.path),
  files: [] as File[],
});

interface FileUpload {
  path: string;
  progress: number;
}

const uploading = reactive<FileUpload[]>([]);
const toast = useToast();

const { open, onChange } = useFileDialog({
  multiple: true,
});
onChange(async (files) => {
  console.log(files);
  if (!files?.length) return;
  const { prefix } = route.query;
  if (!isString(prefix)) return;
  const waitList = Array.from(files).map(async (file) => {
    const state = reactive<FileUpload>({
      path: file.name,
      progress: 0,
    });
    uploading.push(state);
    await upload_file(join(prefix, formData.path, file.name), file, (p) => {
      state.progress = p;
    });
    const index = uploading.indexOf(state);
    uploading.splice(index, 1);
  });
  await Promise.all(waitList);
  toast.add({ title: `${waitList.length} 个文件上传成功` });
});
</script>

<template>
  <UContainer class="py-6">
    <UForm :state="formData" class="mb-5 space-y-4">
      <UFormGroup label="上传到路径" name="path">
        <UInput v-model="formData.path" />
      </UFormGroup>
      <UFormGroup label="上传文件" name="files">
        <UButton type="button" class="!px-6" @click="open">
          <UIcon name="i-tabler-folder" style="font-size: 1.1rem" />
          选择文件
        </UButton>
      </UFormGroup>
    </UForm>
    <ul class="space-y-1">
      <li
        v-for="item in uploading"
        :key="item.path"
        class="flex items-center py-1 text-sm"
      >
        <span class="w-[3rem]">
          {{ item.progress.toFixed(0) + "%" }}
        </span>
        <span class="flex-1 truncate text-gray-500 dark:text-gray-400">
          {{ item.path }}
        </span>
      </li>
    </ul>
  </UContainer>
</template>

<style module></style>
