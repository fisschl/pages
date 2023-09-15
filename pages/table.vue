<script setup lang="ts">
const { data } = useFetch("/api/news");
</script>

<template>
  <main class="p-4">
    <UTable :rows="data || undefined" />
  </main>
</template>

<style scoped></style>
