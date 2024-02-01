<script setup lang="ts">
const navbar = defineModel<boolean>("navbar");
</script>

<template>
  <header
    class="gap-4 bg-neutral-200/20 px-4 backdrop-blur dark:bg-neutral-700/20"
    :class="$style.header"
  >
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <UToggle
      v-model="navbar"
      on-icon="i-tabler-menu"
      off-icon="i-tabler-minimize"
    />
  </header>
</template>

<style module>
.header {
  height: var(--main-header-height);
  width: 100%;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
