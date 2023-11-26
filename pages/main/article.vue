<script setup lang="ts">
import { pick } from "lodash-es";
import { formatDistanceToNow, parseJSON } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { RouteLocationRaw } from "#vue-router";
import type { article } from "@prisma/client";

await useMustLogin();

const columns = [
  {
    key: "name",
    label: "标题",
  },
  {
    key: "updateAt",
    label: "最近访问",
  },
  {
    key: "actions",
    label: "操作",
  },
];

const headers = useRequestHeaders(["cookie"]);
const { data, refresh } = await useFetch("/api/articles", { headers });

const links = computed(() => {
  return data.value?.map((item) => {
    const to: RouteLocationRaw = {
      path: "/editor",
      query: pick(item, "id"),
    };
    const updateAt = formatDistanceToNow(parseJSON(item.updateAt), {
      locale: zhCN,
      addSuffix: true,
    });
    return {
      ...item,
      to,
      updateAt,
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

const actions = (row: Pick<article, "id">) => {
  return [
    [
      {
        label: "删除",
        icon: "i-tabler-trash",
        click: async () => {
          await $fetch("/api/article", {
            method: "DELETE",
            query: { id: row.id },
          });
          await refresh();
        },
      },
    ],
  ];
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
    <template #actions-data="{ row }">
      <UDropdown :items="actions(row)">
        <UButton color="gray" variant="ghost" icon="i-tabler-dots" />
      </UDropdown>
    </template>
  </UTable>
</template>

<style module></style>
