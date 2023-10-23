<script setup lang="ts">
import { Marked } from "marked";
import { highlightAll } from "~/utils/highlight";

const marked = new Marked();
const article = ref<HTMLElement>();

const dataText = useLocalStorage("pages-markdown-text", "");

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

const markdownHtml = ref("");

watchImmediate(dataText, async (text) => {
  markdownHtml.value = await marked.parse(text);
  highlightAll(article);
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
      class="prose mx-4 my-4 max-w-none dark:prose-invert"
      v-html="markdownHtml"
    ></article>
  </div>
</template>

<style module></style>
