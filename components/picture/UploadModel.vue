<script setup lang="ts">
import { join } from "pathe";
import { useFileDialog } from "@vueuse/core";

const visible = defineModel<boolean>("visible");
const props = defineProps<{
  prefix: string;
  path: string;
}>();
const emit = defineEmits<{
  change: [];
}>();

const formData = reactive({
  path: props.path,
});

interface FileUpload {
  file: File;
  progress: number;
}

const list = reactive<FileUpload[]>([]);
const toast = useToast();

const { open, onChange } = useFileDialog({
  multiple: true,
});
onChange(async (files) => {
  if (!files?.length) return;
  for (const file of files) {
    const state = reactive<FileUpload>({
      file: file,
      progress: 0,
    });
    list.push(state);
    const { upload_file } = await import("~/utils/upload");
    await upload_file(
      join(props.prefix, formData.path, file.name),
      file,
      (p) => (state.progress = p),
    );
    const index = list.indexOf(state);
    list.splice(index, 1);
  }
  toast.add({ title: `${files.length} 个文件上传成功` });
  emit("change");
});
</script>

<template>
  <UModal v-model="visible" style="width: 10rem">
    <UCard>
      <UForm :state="formData" class="mb-5 space-y-4">
        <UFormGroup label="上传到路径" name="path">
          <UInput v-model="formData.path" style="max-width: 20rem" />
        </UFormGroup>
        <UFormGroup label="上传文件" name="files">
          <UButton type="button" block class="!px-6" @click="open">
            <UIcon name="i-tabler-folder" style="font-size: 1.1rem" />
            选择文件
          </UButton>
        </UFormGroup>
      </UForm>
      <ul class="space-y-1">
        <li
          v-for="item in list"
          :key="item.file.name"
          class="flex items-center py-1 text-sm"
        >
          <span class="w-[3rem]">
            {{ item.progress.toFixed(0) + "%" }}
          </span>
          <span class="flex-1 truncate text-gray-500 dark:text-gray-400">
            {{ item.file.name }}
          </span>
        </li>
      </ul>
    </UCard>
  </UModal>
</template>
