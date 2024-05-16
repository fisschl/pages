<script setup lang="ts">
import ImageViewer from "../ImageViewer.vue";
import type { Message } from "./type";

defineProps<{
  message: Message;
}>();
</script>

<template>
  <li :id="message.id" class="mb-4 max-w-full">
    <section
      class="relative mb-1 rounded px-3 py-2"
      :class="{
        'bg-stone-400/10 dark:bg-stone-500/10': message.role === 'assistant',
        'bg-violet-500/10 dark:bg-violet-500/20': message.role === 'user',
      }"
    >
      <article
        v-once
        class="prose prose-sm max-w-none dark:prose-invert prose-code:text-sm"
        v-html="message.content"
      />
      <ImageViewer
        v-for="file in message.images"
        :key="file.id"
        class="mt-2 inline-block size-16 object-cover"
        :src="file.image"
      />
    </section>
    <section class="flex gap-1">
      <UButton
        v-if="message.role === 'user'"
        icon="i-tabler-reload"
        size="2xs"
        variant="ghost"
        title="重新发送"
        color="teal"
      />
      <span class="flex-1"></span>
      <UButton
        icon="i-tabler-trash"
        size="2xs"
        variant="ghost"
        color="red"
        title="删除"
      />
    </section>
  </li>
</template>
