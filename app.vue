<script setup lang="ts">
import "~/assets/index.css";

const store = useUserStore();

const { data } = await useFetch("/api/user");
store.u = data.value || undefined;
</script>

<template>
  <NuxtPage />
</template>
