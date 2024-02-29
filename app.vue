<script setup lang="ts">
import { useUserStore } from "./composables/user";
import { useSseStore } from "./composables/sse";

const store = useUserStore();

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/user/auth", { headers });
if (data.value) store.user = data.value;

const { create } = useSseStore();
onMounted(create);
</script>

<template>
  <Html lang="zh-CN">
    <Head>
      <Title> 沅有茝兮醴有兰 </Title>
    </Head>
    <Body :class="$style.root" class="bg-neutral-50 dark:bg-neutral-900">
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
