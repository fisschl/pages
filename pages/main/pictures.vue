<script setup lang="ts">
import { pick } from "lodash-es";
import { useUserStore } from "~/composables/user";
import type { Picture } from "~/server/database/schema";
import { partial } from "filesize";
import { delete_file, upload_file } from "~/server/utils/oss";

const size = partial({ standard: "jedec" });

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
  /**
   * 0 - 1
   */
  progress: number;
  /**
   * byte
   */
  loaded: string;
  total: string;
  status: "waiting" | "uploading";
}

const uploading = reactive(new Map<File, Uploading>());

const dialog = useFileDialog({ multiple: true });
dialog.onChange(async (files) => {
  if (!files) return;
  for (const file of files) {
    uploading.set(file, {
      progress: 0,
      loaded: "",
      total: size(file.size),
      status: "waiting",
    });
  }
  for (const file of files) {
    const { item, token } = await $fetch("/api/picture", {
      method: "POST",
      body: pick(file, ["name", "type"]),
    });
    await upload_file(token, `server/picture/${item.id}`, file);
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
    <section v-if="uploading.size > 0">
      <div v-for="[file, state] in uploading" :key="file.name">
        <p class="flex items-end">
          <span class="flex-1 truncate text-gray-600">{{ file.name }}</span>
          <span class="ml-2 text-gray-400">
            {{ state.loaded }}
            /
            {{ state.total }}
          </span>
        </p>
        <UProgress :value="state.progress" />
      </div>
    </section>
    <section class="mb-6 flex">
      <span class="flex-1"></span>
      <UChip :show="uploading.size > 0">
        <UButton class="px-6" @click="dialog.open">
          <UIcon name="i-tabler-upload" style="font-size: 1.1rem" />

          上传
        </UButton>
      </UChip>
    </section>
    <section
      class="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
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
      class="mt-6"
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
