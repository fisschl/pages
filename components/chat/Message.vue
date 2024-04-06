<script lang="ts">
export const ChatFileSchema = z.object({
  key: z.string(),
});

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  update_at: z.string().optional(),
  files: z.array(ChatFileSchema).optional(),
});

export type Message = output<typeof MessageSchema>;
</script>

<script setup lang="ts">
import { z, type output } from "zod";

const props = defineProps<{
  message: Message;
}>();
</script>

<template>
  <section
    class="message relative rounded px-3 py-2"
    :class="{
      'bg-stone-500/10': message.role === 'assistant',
      'bg-violet-500/15': message.role === 'user',
      [$style.message]: true,
    }"
    :data-id="message.id"
  >
    <article
      class="prose prose-sm max-w-none dark:prose-invert"
      v-html="message.content"
    />
    <img
      v-for="file in message.files"
      :key="file.key"
      class="mt-2 inline-block size-16 object-cover"
      :src="`https://cdn.fisschl.world/${file.key}`"
      alt="..."
    />
  </section>
</template>

<style module>
.message {
  display: block;
}
</style>
