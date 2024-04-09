<script setup lang="ts">
import { extname } from "pathe";
import type { ObjectMeta } from "~/pages/main/store.vue";

const visible = defineModel<boolean>("visible");
const emit = defineEmits<{
  delete: [key: string];
}>();
const props = defineProps<{
  path: string;
  prefix: string;
  item: ObjectMeta;
}>();

const handleDeleteItem = async () => {
  emit("delete", props.item.name);
  visible.value = false;
};

const download = () => {
  const { name } = props.item;
  const qs = new URLSearchParams({
    key: name,
  });
  window.open(`/api/oss/download?${qs}`);
};

const cdn = computed(() => {
  return `https://cdn.fisschl.world/${props.item.name}`;
});

const imageExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".webp",
  ".tiff",
  ".ico",
  ".svg",
];
const videoExtensions = [".mp4", ".webm", ".ogg", ".ogv"];
</script>

<template>
  <UModal v-if="item" v-model="visible">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <p class="truncate">{{ item.name }}</p>
        </div>
      </template>
      <img
        v-if="imageExtensions.includes(extname(item.name))"
        :src="cdn"
        :alt="item.name"
      />
      <video
        v-else-if="videoExtensions.includes(extname(item.name))"
        autoplay
        :src="cdn"
        loop
        controls
      />
      <p v-else class="text-gray-400 dark:text-gray-500">无法预览</p>
      <template #footer>
        <UButton class="mr-3 px-4" color="blue" @click="download">
          <UIcon name="i-tabler-download" style="font-size: 1.1rem" />
          下载
        </UButton>
        <UButton color="red" @click="handleDeleteItem">
          <UIcon name="i-tabler-trash" style="font-size: 1.1rem" />
          删除
        </UButton>
      </template>
    </UCard>
  </UModal>
</template>
