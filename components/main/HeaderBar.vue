<script setup lang="ts">
import { useNavStore } from "~/composables/nav";

const nav = useNavStore();
</script>

<template>
  <header
    class="gap-4 bg-gray-200/20 px-4 backdrop-blur dark:bg-gray-700/20"
    :class="$style.header"
  >
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <UToggle
      v-model="nav.visible"
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
}
</style>
