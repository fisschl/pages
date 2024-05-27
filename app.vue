<script setup lang="ts">
import "~/assets/main.css";
import { useAutoLogin } from "./composables/user";

await useAutoLogin();

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
    {
      rel: "preconnect",
      href: "https://static.bronya.world",
    },
    {
      rel: "stylesheet",
      href: "https://static.bronya.world/font/font.css",
    },
  ],
});
</script>

<template>
  <NuxtPage />
  <UNotifications />
</template>
