<script setup lang="ts">
import "~/assets/markdown.css";
import { useSocket } from "~/composables/socket";
import { z } from "zod";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";
import Placeholder from "@tiptap/extension-placeholder";

useHead({
  title: "翻译",
});

const user = useUserStore();

const { hook } = useSocket(() => ({
  username: "public",
  password: "public",
  topic: `public/translate/${user.token}`,
}));

const message_schema = z.object({
  content: z.string(),
});

const article = ref<HTMLElement>();

hook.on(async (event) => {
  const res = message_schema.safeParse(event);
  if (!res.success) return;
  const message = res.data;
  const { update } = await import("~/utils/snabbdom");
  if (!article.value) return;
  await update(article.value, message.content);
});

const streaming = ref(false);

const stop = async () => {
  await $fetch("/api/translate/stop", {
    method: "POST",
  });
};

const handleSubmit = async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const html = editor.value?.getHTML();
  if (!html) return;
  if (streaming.value) await stop();
  streaming.value = true;
  const res = await $fetch("/api/translate", {
    method: "POST",
    body: { content: html },
  });
  if (res.message !== "完成") return;
  streaming.value = false;
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
    },
  },
});

const clearAll = () => {
  editor.value?.commands.clearContent();
};

const handleClickBottom = (e: MouseEvent) => {
  e.preventDefault();
  editor.value?.commands.focus("end");
};
</script>

<template>
  <UContainer class="my-6">
    <section class="mb-3 flex gap-4">
      <UBadge color="white">
        <span> 自动 </span>
        <UIcon
          name="i-tabler-arrow-right"
          class="mx-3"
          style="font-size: 14px"
        />
        <span> 中文 </span>
      </UBadge>
      <span class="flex-1"></span>
      <UButton icon="i-tabler-clear-all" color="gray" @click="clearAll">
        清空
      </UButton>
      <UButton icon="i-tabler-run" @click="handleSubmit"> 开始翻译 </UButton>
    </section>
    <section
      class="rounded border border-dashed border-gray-500 bg-slate-50 px-2 py-1 focus-within:border-none focus-within:ring dark:border-gray-400 dark:bg-neutral-900"
    >
      <EditorContent v-if="editor" :editor="editor" @paste="handleSubmit" />
      <p
        class="cursor-text"
        style="min-height: 2rem"
        @mousedown="handleClickBottom"
      ></p>
    </section>
    <UDivider class="mb-3 mt-4" icon="i-tabler-language-hiragana" />
    <article
      ref="article"
      class="prose mb-2 max-w-none px-2 dark:prose-invert prose-code:text-base"
    ></article>
    <section class="flex justify-center p-2">
      <UIcon
        v-if="streaming"
        name="i-tabler-loader-2"
        class="animate-spin"
        style="font-size: 18px"
      />
    </section>
  </UContainer>
</template>
