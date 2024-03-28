<script setup lang="ts">
const user = useUserStore();
await user.checkLogin();

const sse = ref<EventSource>();

onMounted(() => {
  sse.value = new EventSource(`/api/sse?key=${user.user?.id}`);
});

const send = async () => {
  await $fetch("/api/chat/send", {
    method: "POST",
    body: {
      content: "你好",
    },
  });
};
</script>

<template>
  <UContainer>
    <UButton @click="send"> 发送 </UButton>
  </UContainer>
</template>
