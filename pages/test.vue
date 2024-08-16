<script setup lang="ts">
const getPlusStorage = (key: string): string => {
  // @ts-expect-error 在 web-view 加载的 HTML 中调用 uni 的 API，需要在 HTML 中引用必要的 JS-SDK
  return plus.storage.getItem(key);
};

const token = ref("");

onMounted(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  token.value = getPlusStorage("LOGIN_TOKEN");
});
</script>

<template>
  <UContainer class="my-6"> LOGIN_TOKEN： {{ token }} </UContainer>
</template>

<style module></style>
