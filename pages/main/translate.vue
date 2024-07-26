<script lang="ts" setup>
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import { z } from "zod";
import "~/assets/markdown.css";
import { useSocket } from "~/composables/socket";
import { v7 as uuid } from "uuid";

useHead({
  title: "翻译",
});

const clientId = ref("");

const socket = useSocket();

onMounted(async () => {
  clientId.value = uuid();
  await socket.connect({
    username: "public",
    topic: `public/translate/${clientId.value}`,
    clientId: clientId.value,
  });
});

const message_schema = z.object({
  content: z.string(),
});

const article = ref<HTMLElement>();
const requestToken = ref("");

socket.on(async (event) => {
  const res = message_schema.safeParse(event);
  if (!res.success) return;
  const message = res.data;
  const { update } = await import("~/utils/snabbdom");
  if (!article.value) return;
  await update(article.value, message.content);
});

const streaming = ref<string[]>([]);

const handleSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const html = editor.value?.getHTML();
  if (!html) return;
  const token = uuid();
  requestToken.value = token;
  streaming.value = [token];
  const res = await $fetch("/api/translate", {
    method: "POST",
    body: {
      content: html,
      clientId: clientId.value,
      requestToken: token,
    },
  });
  if (res.message !== "完成") return;
  if (streaming.value.includes(token)) streaming.value.length = 0;
};

const editor = useEditor({
  extensions: [
    StarterKit,
    Placeholder.configure({
      placeholder: "请输入要翻译的文本",
    }),
  ],
  editorProps: {
    attributes: {
      class: "prose dark:prose-invert prose-code:text-base",
      style: "min-height: 4rem",
    },
  },
});

const clearAll = () => {
  editor.value?.commands.clearContent();
};
</script>

<template>
  <UContainer class="my-6">
    <section class="mb-3 flex gap-4">
      <UBadge color="white">
        <span> 自动 </span>
        <UIcon
          class="mx-3"
          name="i-tabler-arrow-right"
          style="font-size: 14px"
        />
        <span> 中文 </span>
      </UBadge>
      <span class="flex-1"></span>
      <UButton color="gray" icon="i-tabler-clear-all" @click="clearAll">
        清空
      </UButton>
      <UButton icon="i-tabler-run" @click="handleSubmit"> 开始翻译</UButton>
    </section>
    <section
      class="rounded border border-dashed border-gray-500 bg-slate-50 px-2 py-1 focus-within:border-none focus-within:ring dark:border-gray-400 dark:bg-neutral-900"
    >
      <EditorContent v-if="editor" :editor="editor" @paste="handleSubmit" />
    </section>
    <UDivider class="mb-3 mt-4" icon="i-tabler-language-hiragana" />
    <article
      ref="article"
      class="prose mb-2 max-w-none px-2 dark:prose-invert prose-code:text-base"
    ></article>
    <section class="flex justify-center p-2">
      <UIcon
        v-if="streaming.includes(requestToken)"
        class="animate-spin"
        name="i-tabler-loader-2"
        style="font-size: 18px"
      />
    </section>
  </UContainer>
</template>
