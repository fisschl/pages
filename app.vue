<script setup lang="ts">
import { useUserStore } from "./composables/user";
import { useSseStore } from "./composables/sse";

const store = useUserStore();

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/user", { headers });
if (data.value) store.user = data.value;

const { create } = useSseStore();
onMounted(create);
</script>

<template>
  <Html lang="zh-CN">
    <Head>
      <Title> 沅有茝兮醴有兰 </Title>
      <Link rel="preconnect" href="https://cdn.fisschl.world" />
      <Link rel="stylesheet" href="https://cdn.fisschl.world/MiSans/font.css" />
    </Head>
    <Body :class="$style.root">
      <NuxtPage />
      <UNotifications />
    </Body>
  </Html>
</template>

<style module>
.root {
  --main-header-height: 3.5rem;
  --main-navbar-width: 12rem;
}
</style>
