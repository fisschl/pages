<script setup lang="ts">
import { pick } from "lodash-es";
import { type output, z } from "zod";

const send = async () => {
  const res = await $fetch("/api/chat/send", {
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
