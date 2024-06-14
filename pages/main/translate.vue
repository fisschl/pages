<script setup lang="ts">
import { useSocket } from "~/composables/socket";
import { z } from "zod";

useHead({
  title: "翻译",
});

const token = useCookie("token");

const { eventHook } = useSocket(() => ({
  username: "public",
  password: "public",
  topic: `public/translate/${token.value}`,
}));

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
const streaming = ref(false);

const stop = async () => {
  await $fetch("/api/translate/stop", {
    method: "POST",
  });
};

const handleSubmit = async () => {
  await nextTick();
  if (!input.value) return;
  if (streaming.value) await stop();
  streaming.value = true;
  const res = await $fetch("/api/translate", {
    method: "POST",
    body: {
      content: input.value,
    },
  });
  if (res.message !== "完成") return;
  streaming.value = false;
};

const handleKeydown = async (e: KeyboardEvent) => {
  if (e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  await handleSubmit();
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
      <UButton icon="i-tabler-run" @click="handleSubmit"> 开始翻译 </UButton>
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
      class="prose mb-2 max-w-none px-2 dark:prose-invert"
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

<style module></style>
