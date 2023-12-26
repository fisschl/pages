<script setup lang="ts">
import { useNavStore } from "~/composables/nav";

const nav = useNavStore();
const user = useUserStore();

const route = useRoute();
const loginPath = computed(() => {
  const qs = new URLSearchParams({ from: route.fullPath });
  return `/login?${qs}`;
});
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
    <NuxtLink
      v-else
      :to="loginPath"
      class="flex items-center hover:text-gray-600 dark:hover:text-gray-300"
    >
      <UIcon name="i-tabler-user" style="font-size: 18px" />
    </NuxtLink>
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
