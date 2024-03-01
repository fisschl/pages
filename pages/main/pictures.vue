<script setup lang="ts">
import { pick } from "lodash-es";
import { useUserStore } from "~/composables/user";
import type { Picture } from "~/server/database/schema";
import { delete_file, upload_file } from "~/server/utils/oss";

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

interface Uploading {
  percent: number;
  status: "waiting" | "uploading";
}

const uploading = reactive(new Map<File, Uploading>());

const dialog = useFileDialog({ multiple: true });
dialog.onChange(async (files) => {
  if (!files) return;
  for (const file of files) {
    uploading.set(file, {
      percent: 0,
      status: "waiting",
    });
  }
  for (const file of files) {
    const { item, token } = await $fetch("/api/picture", {
      method: "POST",
      body: pick(file, ["name", "type"]),
    });
    await upload_file(token, `server/picture/${item.id}`, file, (percent) => {
      uploading.set(file, {
        percent,
        status: "uploading",
      });
    });
    data.value?.list.unshift(item);
    uploading.delete(file);
  }
});

const currentPicture = ref<Picture>();
const isViewModalVisible = ref(false);

const handleClickItem = (e: Picture) => {
  currentPicture.value = e;
  isViewModalVisible.value = true;
};
const handleDeleteOne = async ({ id }: Picture) => {
  const { token } = await $fetch("/api/picture", {
    method: "DELETE",
    query: { id },
  });
  await delete_file(token, `server/picture/${id}`);
  const index = data.value?.list.findIndex((item) => item.id === id);
  if (index === undefined || index === -1) return;
  data.value?.list.splice(index, 1);
};
</script>

<template>
  <UContainer class="py-6">
    <section v-if="uploading.size > 0" class="mb-6 space-y-1">
      <div
        v-for="[file, state] in uploading"
        :key="file.name"
        class="flex items-center text-sm"
      >
        <p class="w-1/2 truncate">{{ file.name }}</p>
        <UMeter :value="state.percent" />
      </div>
    </section>
    <section class="mb-6 flex">
      <UButton class="px-6" @click="dialog.open">
        <UIcon name="i-tabler-upload" style="font-size: 1.1rem" />
        上传
      </UButton>
    </section>
    <section
      class="mb-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
    >
      <div
        v-for="item in data?.list"
        :key="item.id"
        class="relative overflow-hidden rounded"
        @click="handleClickItem(item)"
      >
        <img
          v-if="item.content_type.startsWith('image/')"
          class="aspect-1 object-cover transition hover:scale-105"
          :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
          :alt="item.name"
        />
        <video
          v-else-if="item.content_type.startsWith('video/')"
          class="aspect-1 object-cover transition hover:scale-105"
          autoplay
          :src="`https://cdn.fisschl.world/server/picture/${item.id}`"
          loop
          muted
        />
        <UIcon
          v-else
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          name="i-tabler-box-seam"
          style="font-size: 1.6rem"
        />
      </div>
    </section>
    <UPagination
      v-if="data?.total"
      v-model="page.page"
      :page-count="5"
      :total="data.total"
      show-last
      show-first
    />
    <PictureDetailModel
      v-model:visible="isViewModalVisible"
      v-model:item="currentPicture"
      @delete="handleDeleteOne"
    />
  </UContainer>
</template>
