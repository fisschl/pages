<script setup lang="ts">
import { useUserStore } from "./composables/user";
import type { UnwrapRef } from "vue";

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/auth", { headers });
const store = useUserStore();
if (data.value) store.user = data.value;

const route = useRoute();
const router = useRouter();

onMounted(() => {
  if (!route.query.token) return;
  router.replace({
    query: { ...route.query, token: undefined },
  });
});

export type User = NonNullable<UnwrapRef<typeof data>>;
</script>

<template>
  <Html lang="zh-CN">
    <Head>
      <Title> 沅有茝兮醴有兰 </Title>
    </Head>
    <Body class="h-dvh overflow-auto bg-neutral-50 dark:bg-neutral-900">
      <NuxtPage />
      <UNotifications />
    </Body>
  </Html>
</template>

<style>
html:root {
  --el-font-family: "MiSans", sans-serif;
}

html {
  overflow: hidden;
}
</style>
