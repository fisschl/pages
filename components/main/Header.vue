<script setup lang="ts"></script>

<template>
  <header
    class="bg-zinc-100/50 shadow-sm backdrop-blur dark:bg-zinc-900/50"
    :class="$style.header"
  >
    <UContainer class="flex items-center gap-2 py-2">
      <h1 class="flex-1">大道之行也 天下为公</h1>
      <MainMusicButton />
      <MainNavigation />
    </UContainer>
  </header>
</template>

<style module>
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
