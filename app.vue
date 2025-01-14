<script lang="ts" setup>
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";
import "@fontsource-variable/fira-code";

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
watchEffect(() => {
  if (typeof window === "undefined") return;
  const { fullPath } = route;
  if (typeof navigator === "undefined" || !navigator.userAgent) return;
  $fetch("/api/visit_log", {
    method: "POST",
    body: {
      full_path: fullPath,
      ua: navigator.userAgent,
    },
  });
});
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

html:root {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
}
:root body {
  font-family: inherit;
}
</style>
