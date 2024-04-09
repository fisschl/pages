<script setup lang="ts">
import { useUserStore } from "./composables/user";
// @ts-expect-error element-plus locale mjs file
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import type { UnwrapRef } from "vue";

const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/auth", { headers });
const store = useUserStore();
if (data.value) store.user = data.value;

export type User = NonNullable<UnwrapRef<typeof data>>;
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

<style>
html:root {
  --el-font-family: "MiSans", sans-serif;
}

html {
  overflow: hidden;
}
</style>
