<script setup lang="ts">
import { pick } from "lodash-es";
import { useUserStore } from "~/composables/user";
import type { Picture } from "~/server/utils/schema";

const store = useUserStore();
await store.checkLogin();

const page = reactive({
  page: 1,
  pageSize: 64,
});

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/picture/pictures", {
  query: computed(() => ({
    ...page,
  })),
  headers,
});

const waitList = reactive(new Map<File, string>());

const dialog = useFileDialog({ multiple: true });
dialog.onChange(async (files) => {
  if (!files) return;
  for (const file of files) {
    waitList.set(file, "waiting");
  }
  for (const file of files) {
    waitList.set(file, "uploading");
    const item = await $fetch<any>("/api/picture", {
      method: "POST",
      body: pick(file, ["name", "type"]),
    });
    const filename = encodeURIComponent(file.name);
    await $fetch(item.url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
    data.value?.list.unshift(item);
    waitList.delete(file);
  }
});

const viewItem = ref<Picture>();
const isViewModalVisible = ref(false);

const handleClickItem = (e: Picture) => {
  viewItem.value = e;
  isViewModalVisible.value = true;
};

const handleDeleteItem = async () => {
  await $fetch("/api/picture", {
    method: "DELETE",
    query: { id: viewItem.value?.id },
  });
  const index = data.value?.list.findIndex(
    (item) => item.id === viewItem.value?.id,
  );
  if (index === undefined || index === -1) return;
  data.value?.list.splice(index, 1);
  isViewModalVisible.value = false;
};

const downloadURL = computed(() => {
  if (!viewItem.value) return;
  const { id } = viewItem.value;
  const qs = new URLSearchParams({ id });
  return `/api/picture/download?${qs}`;
});

const download = () => {
  window.open(downloadURL.value);
};
</script>

<template>
  <UContainer class="py-6">
    <section class="mb-6 flex">
      <span class="flex-1"></span>
      <UButton class="px-6" @click="dialog.open">
        <UIcon name="i-tabler-upload" style="font-size: 1.1rem" />
        上传
        <span v-if="waitList.size"> （ {{ waitList.size }} ） </span>
      </UButton>
    </section>
    <section
      class="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
    >
      <div
        v-for="item in data?.list"
        :key="item.id"
        class="relative overflow-hidden rounded"
      >
        <img
          v-if="item.content_type.startsWith('image/')"
          class="aspect-1 object-cover transition hover:scale-105"
          :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
          :alt="item.name"
          @click="handleClickItem(item)"
        />
        <video
          v-else-if="item.content_type.startsWith('video/')"
          class="aspect-1 object-cover transition hover:scale-105"
          autoplay
          :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
          loop
          muted
          @click="handleClickItem(item)"
        />
        <UIcon
          v-else
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          name="i-tabler-box-seam"
          style="font-size: 1.8rem"
        />
      </div>
    </section>
    <UModal v-if="viewItem" v-model="isViewModalVisible">
      <UCard>
        <template #header>
          <p class="truncate">{{ viewItem.name }}</p>
        </template>
        <img
          v-if="viewItem.content_type.startsWith('image/')"
          :src="downloadURL"
          :alt="viewItem.name"
        />
        <video
          v-else-if="viewItem.content_type.startsWith('video/')"
          autoplay
          :src="downloadURL"
          loop
          controls
        />
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
    <UPagination
      v-if="data?.total"
      v-model="page.page"
      class="mt-6"
      :page-count="5"
      :total="data.total"
      show-last
      show-first
    />
  </UContainer>
</template>
