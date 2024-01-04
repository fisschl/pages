<script setup lang="ts">
await navigateTo("/main/home");
</script>

<template>
  <main class="flex h-screen w-screen items-center justify-center">
    <UIcon
      name="i-tabler-loader"
      class="animate-spin"
      style="font-size: 1.2rem"
    />
  </main>
</template>
