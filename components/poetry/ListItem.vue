<script setup lang="ts">
const props = defineProps<{
  item: Record<string, string>;
}>();

const data = computed(() => {
  const { item } = props;
  const { library } = item;
  switch (library) {
    case "楚辞": {
      const { author, content, section } = item;
      const title = `${section} ${item.title}`;
      return { title, author, content };
    }
    case "诗经": {
      const { content, section, chapter } = item;
      const title = `${section} ${item.title}`;
      const author = chapter;
      return { title, author, content };
    }
    case "宋词": {
      const { paragraphs, author, rhythmic } = item;
      const title = rhythmic;
      const content = paragraphs;
      return { title, author, content };
    }
    default: {
      return item;
    }
  }
});
</script>

<template>
  <article class="">
    <p class="mb-1 flex items-center gap-3 text-base">
      <span class="font-bold"> {{ data.title }} </span>
      <span class="text-sm text-gray-400"> {{ data.author }} </span>
    </p>
    <div
      :class="$style.content"
      class="text-sm text-zinc-600 dark:text-zinc-200"
      v-html="data.content"
    ></div>
  </article>
</template>

<style module>
.content em {
  font-style: normal;
  color: #007bff;
}
</style>
