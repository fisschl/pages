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
];
</script>

<template>
  <UHorizontalNavigation :links="links" class="px-2" />
  <NuxtPage />
  <AppFooter />
</template>

<style scoped></style>
