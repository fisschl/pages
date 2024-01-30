<script setup lang="ts">
const store = useUserStore();

const test = async () => {
  await $fetch("/api/user", {
    method: "PUT",
    body: { avatar_id: store.user?.avatar_id },
  });
};
</script>

<template>
  <UContainer class="py-6">
    <UButton @click="test"> 测试 </UButton>
  </UContainer>
</template>
