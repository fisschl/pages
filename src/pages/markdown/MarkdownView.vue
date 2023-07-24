<script setup lang="ts">
import MilkdownEdit from "./MilkdownEdit.vue";
import { MilkdownProvider } from "@milkdown/vue";
</script>

<template>
  <article class="flex h-screen flex-col">
    <MilkdownProvider>
      <MilkdownEdit class="flex-1" />
    </MilkdownProvider>
  </article>
</template>
