<script lang="ts" setup>
import "@fontsource-variable/noto-sans-sc";
import "@fontsource-variable/open-sans";
import { parseRecord } from "~/utils/query";
import "@fontsource-variable/fira-code";

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

const route = useRoute();
const query = parseRecord(route.query);

const router = useRouter();

onMounted(async () => {
  if (!query.token) return;
  await router.replace({
    query: { ...query, token: undefined },
  });
});

const token = useCookie("token", {
  // 120 天
  maxAge: 60 * 60 * 24 * 120,
});
if (query.token) token.value = query.token;

const theme = useCookie("theme", {
  // 120 天
  maxAge: 60 * 60 * 24 * 120,
});
const colorMode = useColorMode();

watchEffect(() => {
  theme.value = colorMode.value;
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

html:root,
body {
  font-family: "Open Sans Variable", "Noto Sans SC Variable", sans-serif;
}
</style>
