<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

const route = useRoute();

const { data } = useFetch("/api/libraries", {
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
  <ul>
    <li v-for="item in data?.hits" :key="item.id" class="px-4 py-2">
      <p class="flex items-center gap-3 text-base">
        <span class="mr-2"> {{ item.section }} </span>
        <span> {{ item.title }} </span>
      </p>
      <span class="text-sm text-gray-400"> {{ item.author }} </span>
      <p v-for="(text, index) in item.content" :key="index">
        {{ text }}
      </p>
    </li>
  </ul>
</template>
