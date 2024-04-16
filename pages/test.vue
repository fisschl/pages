<script setup lang="ts">
const handleClick = async () => {
  const res = await $fetch("/api/chat/lone_file", {
    method: "DELETE",
  });
  console.log(res);
};
</script>

<template>
  <UContainer class="py-4">
    <UButton type="primary" @click="handleClick">测试</UButton>
  </UContainer>
</template>
