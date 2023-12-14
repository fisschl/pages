<script setup lang="ts">
const props = defineProps<{
  item: Record<string, string>;
}>();

const data = computed(() => {
  const { item } = props;
  const { library } = item;
  switch (library) {
    case "楚辞": {
      const title = `${item.section} ${item.title}`;
      const { author, content } = item;
      return { title, author, content };
    }
    default: {
      return item;
    }
  }
});
</script>

<template>
  <article class="px-4 py-2">
    <p class="flex items-center gap-3 text-base">
      <span> {{ data.title }} </span>
      <span class="text-sm text-gray-400"> {{ data.author }} </span>
    </p>
    <div :class="$style.content" v-html="data.content"></div>
  </article>
</template>

<style module>
.content em {
  font-style: normal;
  color: #007bff;
}
</style>
