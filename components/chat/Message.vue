<script setup lang="ts">
import type { Message } from "./type";

const props = defineProps<{
  message: Message;
}>();

onMounted(async () => {
  const { message } = props;
  const article = document.getElementById(`article_${message.message_id}`);
  if (!article) return;
  const { renderMermaid } = await import("./mermaid");
  await renderMermaid(article);
});
</script>

<template>
  <li
    class="relative mb-4 max-w-full rounded px-3 py-2"
    :class="{
      'bg-stone-300/10 dark:bg-stone-500/10': message.role === 'assistant',
      'bg-violet-500/10 dark:bg-violet-500/20': message.role === 'user',
    }"
  >
    <article
      v-once
      :id="`article_${message.message_id}`"
      :class="$style.article"
      class="prose prose-sm max-w-none dark:prose-invert prose-code:text-sm"
      v-html="message.content"
    />
    <img
      v-for="file in message.images"
      :key="file.image_id"
      class="mt-2 inline-block size-16 object-cover"
      :src="file.url"
    />
  </li>
</template>

<style module>
.article tr th {
  text-align: left;
}
</style>
