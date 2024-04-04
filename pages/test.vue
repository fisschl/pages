<script setup lang="ts">
const fileSelector = useFileDialog({ accept: "image/*", multiple: true });
fileSelector.onChange(async (files) => {
  if (!files) return;
 
});

const send = async () => {
  const res = await $fetch("/api/chat/test");
  console.log(res);
};
</script>

<template>
  <UContainer class="py-4">
    <UButton @click="send"> Hello World </UButton>
  </UContainer>
</template>
