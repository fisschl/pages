<script setup lang="ts">
import type { Picture } from "~/server/utils/schema";

const visible = defineModel<boolean>("visible");
const item = defineModel<Picture>("item");
const emit = defineEmits<{
  delete: [Picture];
}>();

const handleDeleteItem = async () => {
  if (!item.value) return;
  const { id } = item.value;
  await $fetch("/api/picture", {
    method: "DELETE",
    query: { id },
  });
  emit("delete", item.value);
  visible.value = false;
};

const url = computed(() => {
  if (!item.value) return;
  const { id } = item.value;
  const qs = new URLSearchParams({ id });
  return `/api/picture/download?${qs}`;
});

const download = () => {
  window.open(url.value);
};

const nameEditor = reactive({
  name: item.value?.name,
  visible: false,
});

const changeEditMode = async () => {
  if (!item.value) return;
  const { id } = item.value;
  nameEditor.visible = !nameEditor.visible;
  if (nameEditor.visible) {
    // 进入编辑状态
    nameEditor.name = item.value.name;
  } else {
    // 退出编辑状态，保存
    const name = nameEditor.name?.trim();
    if (!name) return;
    await $fetch("/api/picture/rename", {
      method: "PUT",
      body: { id, name },
    });
    item.value.name = name;
  }
};
</script>

<template>
  <UModal v-if="item" v-model="visible">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <p v-if="!nameEditor.visible" class="truncate">{{ item.name }}</p>
          <UInput v-else v-model="nameEditor.name" />
          <UButton
            :padded="false"
            variant="link"
            size="xs"
            :icon="nameEditor.visible ? 'i-tabler-checks' : 'i-tabler-edit'"
            @click="changeEditMode"
          />
        </div>
      </template>
      <img
        v-if="item.content_type.startsWith('image/')"
        :src="url"
        :alt="item.name"
      />
      <video
        v-else-if="item.content_type.startsWith('video/')"
        autoplay
        :src="url"
        loop
        controls
      />
      <div v-else class="flex justify-center py-6">
        <UIcon name="i-tabler-box-seam" style="font-size: 1.8rem" />
      </div>
      <template #footer>
        <UButton class="mr-3 px-4" @click="download">
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

<style module></style>
