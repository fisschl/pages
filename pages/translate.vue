<script setup lang="ts">
import AppFooter from "~/components/AppFooter.vue";

const links = [
  {
    label: "翻译",
    icon: "i-tabler-language-hiragana",
    to: "/translate/articles",
  },
  {
    label: "命名",
    icon: "i-tabler-writing-sign",
    to: "/translate/variables",
  },
  {
    label: "文字识别",
    icon: "i-tabler-credit-card",
    to: "/translate/ocr",
  },
];
</script>

<template>
  <UHorizontalNavigation :links="links" class="px-2 pt-1" />
  <NuxtPage />
  <AppFooter />
</template>

<style scoped></style>
