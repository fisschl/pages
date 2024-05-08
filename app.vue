<script setup lang="ts">
import "~/assets/main.css";
import { useAutoLogin } from "./composables/user";

await useAutoLogin();
</script>

<template>
  <Html lang="zh-CN">
    <Head>
      <Title> 沅有茝兮醴有兰 </Title>
      <Link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    </Head>
    <Body class="h-dvh overflow-auto bg-neutral-50 dark:bg-neutral-900">
      <NuxtPage />
      <UNotifications />
    </Body>
  </Html>
</template>
