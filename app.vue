<script setup lang="ts">
import "~/assets/index.css";

const store = useUserStore();
const headers = useRequestHeaders(["cookie"]);
const { data } = await useFetch("/api/user", { headers });
store.u = data.value || undefined;
</script>

<template>
  <NuxtPage />
</template>
