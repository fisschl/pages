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

const dialog = useFileDialog({ accept: "image/*", multiple: true });
dialog.onChange(async (files) => {
  if (!files) return;
  for (const file of files) {
    const item = await $fetch("/api/picture", {
      method: "POST",
      body: pick(file, ["name", "type"]),
    });
    await $fetch(item.url, {
      method: "PUT",
      body: file,
    });
    data.value?.list.unshift(item);
  }
});

const viewItem = ref<Picture>();
const isViewModalVisible = ref(false);

const handleClickItem = (e: Event) => {
  const target = e.currentTarget;
  if (!(target instanceof HTMLElement)) return;
  const { id } = target.dataset;
  if (!id) return;
  viewItem.value = data.value?.list?.find((item) => item.id === id);
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
</script>

<template>
  <UContainer class="py-6">
    <section class="mb-6 flex">
      <span class="flex-1"></span>
      <UButton class="px-6" @click="dialog.open">
        <UIcon name="i-tabler-upload" style="font-size: 1.1rem" />
        上传
      </UButton>
    </section>
    <section
      class="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
    >
      <div
        v-for="item in data?.list"
        :key="item.id"
        class="overflow-hidden rounded"
        :data-id="item.id"
        @click="handleClickItem"
      >
        <img
          class="aspect-1 object-cover transition hover:scale-105"
          :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
          :alt="item.name"
        />
      </div>
    </section>
    <UModal v-if="viewItem" v-model="isViewModalVisible">
      <UCard>
        <template #header>
          <p class="truncate">{{ viewItem.name }}</p>
        </template>
        <img
          :src="`https://cdn.fisschl.world/server/picture/${viewItem.id}`"
          :alt="viewItem.name"
        />
        <template #footer>
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
