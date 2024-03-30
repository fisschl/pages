<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import { join, basename } from "pathe";
import { ofetch } from "ofetch";
import type { ObjectMeta } from "ali-oss";
import type { SerializeObject } from "nitropack";

const user = useUserStore();
await user.checkLogin();

const prefix = `home/${user.user?.id}/store`;
const path = ref("/");

const headers = useRequestHeaders(["cookie"]);
const { data, refresh } = await useFetch("/api/oss/list", {
  query: computed(() => ({
    prefix: join(prefix, path.value),
  })),
  headers,
});

const handleDelete = async (key: string) => {
  await ofetch("/api/oss/delete", {
    method: "DELETE",
    query: {
      key: key,
    },
    headers: {
      token: user.token || "",
    },
  });
  await refresh();
};

const current = ref<SerializeObject<ObjectMeta>>();
const isDetailShow = ref(false);
const handleClickItem = async (e: MouseEvent) => {
  if (!(e.target instanceof Element)) return;
  const li = e.target.closest(`[data-name]`);
  if (!(li instanceof HTMLElement)) return;
  const { name } = li.dataset;
  const item = data.value?.objects.find((item) => item.name === name);
  current.value = item;
  await nextTick();
  isDetailShow.value = true;
};
const isUploadShow = ref(false);
</script>

<template>
  <UContainer class="py-6">
    <ul v-if="data" class="space-y-1">
      <li
        v-for="item in data.prefixes"
        :key="item"
        class="flex cursor-pointer items-center rounded bg-zinc-50 px-3 py-1 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
      >
        <UIcon
          name="i-tabler-folder"
          class="mr-2 text-yellow-500"
          style="font-size: 1.2rem"
        />
        <span class="flex-1 truncate">
          {{ basename(item) }}
        </span>
      </li>
      <li
        v-for="item in data.objects"
        :key="item.name"
        class="flex cursor-pointer items-center rounded bg-zinc-50 px-3 py-1 transition hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700"
        :data-name="item.name"
        @click="handleClickItem"
      >
        <UIcon
          name="i-tabler-file-filled"
          class="mr-2 text-blue-500"
          style="font-size: 1.2rem"
        />
        <span class="flex-1 truncate py-[2px]">
          {{ basename(item.name) }}
        </span>
      </li>
    </ul>
    <div class="my-5 flex justify-center">
      <UButton icon="i-tabler-plus" @click="isUploadShow = true">
        上传文件
      </UButton>
    </div>
    <PictureUploadModel
      v-model:visible="isUploadShow"
      :prefix="prefix"
      :path="path"
      @change="refresh"
    />
    <PictureDetailModel
      v-if="current"
      v-model:visible="isDetailShow"
      :prefix="prefix"
      :path="path"
      :item="current"
      @delete="handleDelete"
    />
  </UContainer>
</template>
