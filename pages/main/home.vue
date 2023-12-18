<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

const libraryOptions = ["楚辞", "诗经", "宋词"];
const library = useRouteQuery("library", "楚辞");
const keyword = useRouteQuery("keyword", "");

const query = computed(() => ({
  keyword: keyword.value,
  library: library.value,
}));

const { data } = useFetch<Record<string, string>[]>("/api/poetries", {
  query: refDebounced(query, 200),
});
</script>

<template>
  <div class="flex flex-wrap gap-3 px-4 py-3">
    <USelectMenu v-model="library" :options="libraryOptions" />
    <UInput v-model="keyword" />
  </div>
  <div class="divide-y divide-gray-100 dark:divide-gray-800">
    <Suspense v-for="item in data" :key="item.id">
      <PoetryListItem :item="item" class="mx-4 py-3" />
    </Suspense>
  </div>
</template>
