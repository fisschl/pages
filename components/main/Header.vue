<script setup lang="ts">
const isNavigationVisible = ref(false);
</script>

<template>
  <header
    class="gap-3 bg-zinc-100/50 px-4 py-2 shadow-sm backdrop-blur dark:bg-zinc-900/50"
    :class="$style.header"
  >
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <MainMusicButton />
    <UButton
      variant="soft"
      color="indigo"
      square
      icon="i-tabler-menu"
      @click="isNavigationVisible = true"
    />
    <MainNavigation v-model:visible="isNavigationVisible" />
  </header>
</template>

<style module>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
}
</style>
