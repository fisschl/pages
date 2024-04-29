<script setup lang="ts">
import "~/assets/main.css";
import { useUserStore } from "./composables/user";
import type { UnwrapRef } from "vue";

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/auth", { headers });
export type User = NonNullable<UnwrapRef<typeof data>>;
const store = useUserStore();
onMounted(store.tokenAccept);
if (data.value) store.user = data.value;
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
