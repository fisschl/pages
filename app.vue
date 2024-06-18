<script setup lang="ts">
import { useAutoLogin } from "./composables/user";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/noto-sans-sc";

useHead({
  htmlAttrs: {
    lang: "zh-CN",
  },
  title: "沅有茝兮醴有兰",
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "https://static.bronya.world/favicon.svg",
    },
  ],
});

await useAutoLogin();
</script>

<template>
  <NuxtPage />
  <UNotifications />
</template>

<style>
#__nuxt {
  height: 100dvh;
  overflow: auto;
}

body {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
}
</style>
