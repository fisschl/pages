<script setup lang="ts">
import { Marked } from "marked";
import { highlight } from "~/utils/highlight";

const marked = new Marked();
const article = ref<HTMLElement | null>(null);

const dataText = useLocalStorage("pages-markdown-text", "# Hello World");

const { open, onChange } = useFileDialog({ accept: ".md,.txt" });
onChange((files) => {
  const file = files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const { result } = reader;
    if (typeof result !== "string") return;
    dataText.value = result;
  };
  reader.readAsText(file);
});

const mdHtml = computed(() => {
  highlight(article.value);
  return marked.parse(dataText.value);
});
</script>

<template>
  <div class="w-full flex-1">
    <div class="flex gap-4 px-4 py-2">
      <span class="flex-1"></span>
      <UButton @click="open"> 上传文件 </UButton>
    </div>
    <article
      ref="article"
      class="prose mx-5 my-4 max-w-none dark:prose-invert"
      v-html="mdHtml"
    ></article>
  </div>
</template>

<style module></style>
