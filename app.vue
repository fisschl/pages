<script lang="ts" setup>
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
  ],
});
</script>

<template>
  <UApp> <NuxtPage /> </UApp>
</template>

<style>
html:root {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
}
:root body {
  font-family: inherit;
}
</style>
