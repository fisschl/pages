<script setup lang="ts">
import { useSocket } from "~/composables/socket";
import { z } from "zod";

const token = useCookie("token");

const { eventHook } = useSocket({
  username: "public",
  password: "public",
  topic: `public/translate/${token.value}`,
});

const message_schema = z.object({
  content: z.string(),
});

const article = ref<HTMLElement>();

eventHook.on(async (event) => {
  const res = message_schema.safeParse(event);
  if (!res.success) return;
  const message = res.data;
  const { update } = await import("~/utils/snabbdom");
  if (!article.value) return;
  await update(article.value, message.content);
});

const input = ref("");

const handleSubmit = async () => {
  await nextTick();
  if (!input.value) return;
  await $fetch("/api/translate", {
    method: "POST",
    body: {
      content: input.value,
      language: language.value,
    },
  });
};

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  await handleSubmit();
};

const languages = ["中文", "English"];
const language = ref("中文");
</script>

<template>
  <UContainer class="my-6">
    <section class="mb-3 flex gap-4">
      <USelectMenu
        v-model="language"
        :options="languages"
        placeholder="目标语言"
        @change="handleSubmit"
      />
      <span class="flex-1"></span>
      <UButton icon="i-tabler-player-play" @click="handleSubmit">
        翻译
      </UButton>
    </section>
    <UTextarea
      v-model="input"
      autofocus
      autoresize
      size="lg"
      placeholder="输入要翻译的内容"
      @keydown.enter="handleKeydown"
      @paste="handleSubmit"
    />
    <UDivider class="mb-3 mt-4" icon="i-tabler-language-hiragana" />
    <article
      ref="article"
      class="prose mb-10 max-w-none px-2 dark:prose-invert"
    ></article>
  </UContainer>
</template>

<style module></style>
