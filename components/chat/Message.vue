<script lang="ts">
import type { VNode } from "snabbdom";
import mitt from "mitt";
import { useLifeCycle } from "~/composables/setup";
import { z } from "zod";
import type { DropdownItem } from "#ui/types";

export const file_schema = z.object({
  key: z.string(),
});

export const message_schema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  create_at: z.string().optional(),
  chat_file: z.array(file_schema).optional(),
});

export type Message = z.output<typeof message_schema>;

export const updateContentEmitter = mitt<Record<string, string>>();
</script>

<script setup lang="ts">
const props = defineProps<{
  message: Message;
}>();

const emit = defineEmits<{
  delete: [Message];
}>();

const articleElement = ref<HTMLElement>();
const lastVNode = shallowRef<VNode>();

const createInnerElement = () => {
  const element = document.createElement("p");
  articleElement.value!.replaceChildren(element);
  return element;
};

const updateContent = async (content: string) => {
  if (!articleElement.value) return;
  const { patch, parse } = await import("~/utils/snabbdom");
  const node = parse(content);
  lastVNode.value = patch(lastVNode.value || createInnerElement(), node);
};

useLifeCycle(() => {
  const { id } = props.message;
  updateContentEmitter.on(id, updateContent);
  return () => updateContentEmitter.off(id);
});

const options: DropdownItem[][] = [
  [
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
      shortcuts: ["R"],
    },
  ],
  [
    {
      label: "删除",
      icon: "i-tabler-trash",
      click: async () => {
        const { message } = props;
        await $fetch(`/api/chat/message`, {
          method: "DELETE",
          query: { id: message.id },
        });
        emit("delete", message);
      },
      shortcuts: ["Delete"],
    },
  ],
];
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
        ref="articleElement"
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
