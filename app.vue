<script lang="ts" setup>
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";
import { debounce } from "lodash-es";

useHead({
  link: [
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
  ],
});

const route = useRoute();

const reportVisit = debounce(() => {
  $fetch("/api/visit_log", {
    method: "POST",
    body: {
      full_path: location.href,
      ua: navigator.userAgent,
    },
  });
}, 500);

watchEffect(() => {
  const { fullPath } = route;
  if (typeof window === "undefined" || !fullPath) return;
  if (typeof navigator === "undefined" || !navigator.userAgent) return;
  reportVisit();
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

<style>
html:root {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
}
:root body {
  font-family: inherit;
}
</style>
