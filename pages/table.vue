<script setup lang="ts">
const { data } = useFetch("/api/news");
</script>

<template>
  <div class="flex h-screen w-screen flex-col">
    <UTable class="mx-4 flex-1 overflow-auto" :rows="data || undefined" />
  </div>
</template>

<style scoped></style>
