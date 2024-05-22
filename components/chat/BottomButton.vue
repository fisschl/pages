<script setup lang="ts">
import { scrollToBottom } from "~/utils/page_scroll";
</script>

<template>
  <UButton
    size="lg"
    variant="soft"
    icon="i-tabler-chevrons-down"
    class="fixed bottom-6 left-1/2 -translate-x-1/2"
    @click="scrollToBottom"
  />
</template>
