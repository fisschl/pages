<script setup lang="ts">
import type { DropdownItem } from "#ui/types";
import type { Message } from "./type";
const props = defineProps<{
  message: Message;
}>();

const emit = defineEmits<{
  delete: [Message];
}>();

const options: DropdownItem[][] = [];

if (props.message.role === "user") {
  options.unshift([
    {
      label: "重新发送",
      icon: "i-tabler-reload",
      click: async () => {
        const { message } = props;
        const { body } = document;
        body.scrollTop = body.scrollHeight;
        await $fetch(`/api/chat/send`, {
          method: "POST",
          body: { chat_id: message.id },
        });
      },
    },
  ]);
}
options.push([
  {
    label: "删除",
    icon: "i-tabler-trash",
    click: async () => {
      const { message } = props;
      console.log("delete", message);
      await $fetch(`/api/chat/message`, {
        method: "DELETE",
        query: { id: message.id },
      });
      emit("delete", message);
    },
  },
]);
</script>

<template>
  <UDropdown :id="message.id" mode="hover" :items="options" :open-delay="200">
    <section
      class="relative cursor-auto rounded px-3 py-2"
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
      <img
        v-for="file in message.chat_file"
        :key="file.key"
        class="mt-2 inline-block size-16 object-cover"
        :src="`https://cdn.fisschl.world/${file.key}`"
        alt="..."
      />
    </section>
  </UDropdown>
</template>
