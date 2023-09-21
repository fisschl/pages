# Web GPU

```vue
<script setup lang="ts">
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import { getHighlighter } from "shiki";

const highlighter = await getHighlighter({});

const marked = new Marked(
  markedHighlight({
    highlight: (code, lang) => {
      return highlighter.codeToHtml(code, { lang });
    },
  }),
);

const fileUploader = ref<HTMLInputElement | null>(null);
const handleUpload = () => {
  const file = fileUploader.value?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const { result } = reader;
    if (typeof result !== "string") return;
    dataText.value = result;
  };
  reader.readAsText(file);
};
const handleClickUpload = () => fileUploader.value?.click();

const dataText = ref("# Hello World");

const mdHtml = computed(() => {
  return marked.parse(dataText.value);
});
</script>

<template>
  <div>
    <UButton @click="handleClickUpload"> 上传文件 </UButton>
    <input
      ref="fileUploader"
      type="file"
      class="hidden"
      accept=".md,.txt"
      @change="handleUpload"
    />
    <article
      class="prose mx-5 my-4 dark:prose-invert"
      v-html="mdHtml"
    ></article>
  </div>
</template>

<style module></style>
```
