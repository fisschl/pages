<script setup lang="ts">
const scrollToBottom = () => {
  scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};
</script>

<template>
  <UButton
    size="lg"
    variant="soft"
    icon="i-tabler-chevrons-down"
    class="fixed bottom-10 left-1/2 -translate-x-1/2"
    @click="scrollToBottom"
  />
</template>
