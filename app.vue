<script setup lang="ts">
import { useUserStore } from "./composables/user";
// @ts-ignore
import zhCn from "element-plus/dist/locale/zh-cn.mjs";

const store = useUserStore();

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/auth", { headers });
if (data.value) store.user = data.value;
</script>

<template>
  <Html lang="zh-CN">
    <Head>
      <Title> 沅有茝兮醴有兰 </Title>
    </Head>
    <Body class="h-dvh overflow-auto bg-neutral-50 dark:bg-neutral-900">
      <ElConfigProvider :locale="zhCn">
        <NuxtPage />
        <UNotifications />
      </ElConfigProvider>
    </Body>
  </Html>
</template>
