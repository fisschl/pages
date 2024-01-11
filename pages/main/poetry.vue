<script setup lang="ts">
import { parse } from "marked";

const route = useRoute();
const data = await $fetch<Record<string, string>>("/api/poetry", {
  query: route.query,
});

const content = computedAsync(() => {
  if (!data?.content) return;
  return parse(data.content);
});
</script>

<template>
  <UContainer as="article">
    <h2 class="mb-5 pt-6 text-xl font-bold">{{ data?.title }}</h2>
    <p class="mb-4 text-base text-gray-500 dark:text-gray-400">
      {{ data?.author }}
    </p>
    <div class="prose max-w-none dark:prose-invert" v-html="content"></div>
  </UContainer>
</template>
