<script setup lang="ts">
import type { Picture } from "~/server/database/schema";

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

const download = () => {
  if (!item.value) return;
  const { id } = item.value;
  const qs = new URLSearchParams({ id });
  window.open(`/api/picture/download?${qs}`);
};

const nameEditor = reactive({
  name: item.value?.name,
  visible: false,
  submit: async () => {
    if (!item.value) return;
    const { id } = item.value;
    const name = nameEditor.name?.trim();
    if (!name) return;
    await $fetch("/api/picture/rename", {
      method: "PUT",
      body: { id, name },
    });
    item.value.name = name;
  },
  changeVisible: async () => {
    if (!item.value) return;
    nameEditor.visible = !nameEditor.visible;
    if (nameEditor.visible) {
      // 进入编辑状态
      nameEditor.name = item.value.name;
    } else {
      // 退出编辑状态，保存
      await nameEditor.submit();
    }
  },
});

const { copied, copy } = useClipboard();

const handleCopy = () => {
  return copy(`https://cdn.fisschl.world/server/picture/${item.value?.id}`);
};
</script>

<template>
  <UModal v-if="item" v-model="visible">
    <UCard>
      <template #header>
        <div class="flex items-center gap-3">
          <p v-if="!nameEditor.visible" class="truncate">{{ item.name }}</p>
          <UInput
            v-else
            v-model="nameEditor.name"
            @keydown.enter="nameEditor.changeVisible"
          />
          <UButton
            size="xs"
            variant="soft"
            :icon="nameEditor.visible ? 'i-tabler-checks' : 'i-tabler-edit'"
            @click="nameEditor.changeVisible"
          />
        </div>
      </template>
      <img
        v-if="item.content_type.startsWith('image/')"
        :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
        :alt="item.name"
      />
      <video
        v-else-if="item.content_type.startsWith('video/')"
        autoplay
        :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
        loop
        controls
      />
      <div v-else class="flex justify-center py-6">
        <UIcon name="i-tabler-box-seam" style="font-size: 1.8rem" />
      </div>
      <template #footer>
        <UButton class="mr-3 px-4" @click="handleCopy">
          <UIcon
            :name="copied ? 'i-tabler-checks' : 'i-tabler-copy'"
            style="font-size: 1.1rem"
          />
          复制链接
        </UButton>
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

<style module></style>
