<script setup lang="ts">
import { debounce, pick } from "lodash-es";
import type { Article } from "~/components/article/article";

await useMustLogin();

const queryParams = reactive({
  search: "",
});

const headers = useRequestHeaders(["cookie"]);
const { data, refresh } = await useFetch<Article[]>("/api/articles", {
  headers,
  query: queryParams,
  watch: false,
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

const handleSearch = debounce(() => refresh(), 500);
</script>

<template>
  <div class="mb-3 mt-3 flex items-center justify-end px-4">
    <UInput
      v-model="queryParams.search"
      class="mr-4"
      placeholder="搜索"
      icon="i-tabler-search"
      @input="handleSearch"
    />
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
