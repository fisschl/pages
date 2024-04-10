<script lang="ts">
import {
  array,
  object,
  optional,
  picklist,
  string,
  type Output,
} from "valibot";
import type { VNode } from "snabbdom";

export const ChatFileSchema = object({
  key: string(),
});

export const MessageSchema = object({
  id: string(),
  role: picklist(["user", "assistant"]),
  content: string(),
  create_at: optional(string()),
  chat_file: optional(array(ChatFileSchema)),
});

export type Message = Output<typeof MessageSchema>;
</script>

<script setup lang="ts">
const props = defineProps<{
  message: Message;
}>();

const emit = defineEmits<{
  delete: [Message];
}>();

const handleCommand = async (command: string) => {
  const { message } = props;
  if (command === "删除") {
    await $fetch(`/api/chat/message`, {
      method: "DELETE",
      query: { id: message.id },
    });
    emit("delete", message);
    return;
  }
  if (command === "重新发送") {
    const { body } = document;
    body.scrollTop = body.scrollHeight;
    await $fetch(`/api/chat/send`, {
      method: "POST",
      body: { chat_id: message.id },
    });
  }
};

const { content } = props.message;
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

watch(() => props.message.content, updateContent);
</script>

<template>
  <ElDropdown trigger="hover" placement="top" @command="handleCommand">
    <section
      class="relative cursor-auto rounded px-3 py-2"
      :class="{
        'bg-stone-400/10 dark:bg-stone-500/10': message.role === 'assistant',
        'bg-violet-500/10 dark:bg-violet-500/20': message.role === 'user',
      }"
      :data-id="message.id"
    >
      <article
        ref="articleElement"
        class="prose prose-sm max-w-none dark:prose-invert prose-code:text-sm"
        v-html="content"
      />
      <img
        v-for="file in message.chat_file"
        :key="file.key"
        class="mt-2 inline-block size-16 object-cover"
        :src="`https://cdn.fisschl.world/${file.key}`"
        alt="..."
      />
    </section>
    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="删除">
          <UIcon name="i-tabler-trash" style="font-size: 16px" class="mr-2" />
          删除
        </ElDropdownItem>
        <ElDropdownItem v-if="message.role === 'user'" command="重新发送">
          <UIcon name="i-tabler-reload" style="font-size: 16px" class="mr-2" />
          重新发送
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>
