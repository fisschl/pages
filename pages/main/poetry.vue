<script setup lang="ts">
const route = useRoute();
const { data } = await useFetch<Record<string, string>>("/api/poetry", {
  query: { id: route.query.id },
});
</script>

<template>
  <UContainer as="article">
    <h2 class="mb-5 pt-8 text-xl font-bold">{{ data?.title }}</h2>
    <p class="mb-4 text-base text-gray-500 dark:text-gray-400">
      {{ data?.author }}
    </p>
    <div
      class="prose max-w-none dark:prose-invert"
      v-html="data?.content"
    ></div>
  </UContainer>
</template>
