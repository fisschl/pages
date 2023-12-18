<script setup lang="ts">
import { parse } from "marked";

const route = useRoute();
const { data } = await useFetch<Record<string, string>>("/api/poetry", {
  query: route.query,
});

const context = computed(() => {
  if (!data.value) return;
  const { library } = data.value;
  switch (library) {
    case "楚辞": {
      const { author, content, section } = data.value;
      const title = `${section} ${data.value.title}`;
      return { title, author, content };
    }
    case "诗经": {
      const { content, section, chapter } = data.value;
      const title = `${section} ${data.value.title}`;
      const author = chapter;
      return { title, author, content };
    }
    case "宋词": {
      const { paragraphs, author, rhythmic } = data.value;
      const title = rhythmic;
      const content = paragraphs;
      return { title, author, content };
    }
    default: {
      return data.value;
    }
  }
});

const content = computedAsync(() => {
  if (!context.value) return;
  return parse(context.value.content);
});
</script>

<template>
  <UContainer as="article">
    <h2 class="mb-5 pt-6 text-xl font-bold">{{ context?.title }}</h2>
    <p class="mb-4 text-base text-gray-500 dark:text-gray-400">
      {{ context?.author }}
    </p>
    <div class="prose max-w-none dark:prose-invert" v-html="content"></div>
  </UContainer>
</template>
