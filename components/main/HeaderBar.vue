<script setup lang="ts">
import { useNavStore } from "~/composables/nav";

const nav = useNavStore();
const user = useUserStore();
</script>

<template>
  <header
    class="gap-4 bg-gray-200/20 px-4 backdrop-blur dark:bg-gray-700/20"
    :class="$style.header"
  >
    <h1 class="flex-1">大道之行也 天下为公</h1>
    <UBadge v-if="user.u">
      {{ user.u?.name }}
    </UBadge>
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
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 20;
}
</style>
