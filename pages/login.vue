<script lang="ts" setup>
const { query } = useRoute();

const login = async () => {};
</script>

<template>
  <UContainer class="flex h-dvh items-center justify-center py-6">
    <UButton icon="i-tabler-brand-git" @click="login">
      使用 Gitee 登录
    </UButton>
  </UContainer>
</template>
