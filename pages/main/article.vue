<script setup lang="ts">
import { pick } from "lodash-es";

await useMustLogin();

const headers = useRequestHeaders(["cookie"]);
const { data, refresh } = await useFetch("/api/articles", { headers });

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
  <div class="mb-3 mt-3 flex justify-end px-4">
    <UButton class="px-6" @click="handleCreate"> 新建 </UButton>
  </div>
  <ArticleListItem
    v-for="item in data"
    :key="item.id"
    :item="item"
    class="mx-4 mb-2"
    @delete="refresh"
  />
</template>
