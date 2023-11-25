<script setup lang="ts">
import { pick } from "lodash-es";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { RouteLocationRaw } from "#vue-router";

await useMustLogin();

const columns = [
  {
    key: "name",
    label: "标题",
  },
  {
    key: "updateAt",
    label: "更新时间",
  },
];

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/articles", { headers });

const links = computed(() => {
  return data.value?.map((item) => {
    const to: RouteLocationRaw = {
      path: "/editor",
      query: pick(item, "id"),
    };
    const timeText = formatDistanceToNow(parseJSON(item.updateAt), {
      locale: zhCN,
    });
    return {
      ...item,
      to,
      updateAt: timeText + "前",
    };
  });
});

const handleCreate = async () => {
  const item = await $fetch("/api/article", {
    method: "POST",
    body: { name: "新文章" },
  });
  await navigateTo({
    path: `/editor`,
    query: pick(item, "id"),
  });
};
</script>

<template>
  <div class="mt-3 flex justify-end px-4">
    <UButton class="px-6" @click="handleCreate"> 新建 </UButton>
  </div>
  <UTable :rows="links" :columns="columns">
    <template #name-data="{ row }">
      <NuxtLink :to="row.to" class="text-green-500 hover:underline">
        {{ row.name }}
      </NuxtLink>
    </template>
  </UTable>
</template>

<style module></style>
