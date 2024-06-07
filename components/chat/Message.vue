<script setup lang="ts">
import ImageViewer from "../ImageViewer.vue";
import type { Message } from "./type";

const props = defineProps<{
  message: Message;
}>();

onMounted(async () => {
  const { message } = props;
  const article = document.getElementById(`article_${message.id}`);
  if (!article) return;
  const { renderMermaid } = await import("./mermaid");
  await renderMermaid(article);
});
</script>

<template>
  <li
    class="relative mb-4 max-w-full rounded px-3 py-2"
    :class="{
      'bg-stone-400/10 dark:bg-stone-500/10': message.role === 'assistant',
      'bg-violet-500/10 dark:bg-violet-500/20': message.role === 'user',
    }"
  >
    <article
      v-once
      :class="$style.article"
      :id="`article_${message.id}`"
      class="prose prose-sm max-w-none dark:prose-invert prose-code:text-sm"
      v-html="message.content"
    />
    <ImageViewer
      v-for="file in message.images"
      :key="file.image_id"
      class="mt-2 inline-block size-16 object-cover"
      :src="file.image"
    />
  </li>
</template>

<style module>
.article tr th {
  text-align: left;
}
</style>
