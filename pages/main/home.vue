<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

const route = useRoute();

const { data } = useFetch<Record<string, string>[]>("/api/poetries", {
  query: computed(() => ({
    ...route.query,
    library: "楚辞",
  })),
});

const keyword = useRouteQuery("keyword", "");
</script>

<template>
  <div class="flex flex-wrap px-4 py-3">
    <UInput v-model="keyword" />
  </div>
  <Suspense v-for="item in data" :key="item.id">
    <PoetryListItem :item="item" />
  </Suspense>
</template>
