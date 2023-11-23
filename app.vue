<script setup lang="ts">
const store = useUserStore();

const { data } = await useFetch("/api/user");
store.u = data.value || undefined;
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
