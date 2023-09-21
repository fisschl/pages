<script setup lang="ts">
import { debounce } from "lodash-es";
import { Marked } from "marked";
import { getHighlighter, setCDN } from "shiki";

setCDN("https://cdn.jsdelivr.net/npm/shiki/");

const marked = new Marked();
const article = ref<HTMLElement | null>(null);

const parseHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const ele = doc.body.firstElementChild;
  if (!(ele instanceof HTMLElement)) return null;
  return ele;
};

const asyncHighlighter = getHighlighter({});

const highlight = debounce(async () => {
  if (typeof window === "undefined") return;
  const highlighter = await asyncHighlighter;
  article.value?.querySelectorAll("pre code").forEach((block) => {
    const pre = block.closest("pre");
    if (!pre || pre.classList.contains("shiki")) return;
    const lang = block.className.match(/language-(\S+)/)?.[1];
    if (!lang) return;
    const code = block.textContent;
    if (!code) return;
    const html = highlighter.codeToHtml(code, { lang });
    const newPre = parseHtml(html);
    if (!newPre) return;
    newPre.dataset.lang = lang;
    pre.replaceWith(newPre);
  });
}, 200);

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
  highlight();
  return marked.parse(dataText.value);
});
</script>

<template>
  <div class="flex-1">
    <div class="flex gap-4 px-4 py-2">
      <span class="flex-1"></span>
      <UButton @click="open"> 上传文件 </UButton>
    </div>
    <article
      ref="article"
      class="prose mx-5 my-4 dark:prose-invert"
      v-html="mdHtml"
    ></article>
  </div>
</template>

<style module></style>
