<script setup lang="ts">
import { useNavStore } from "~/composables/nav";

const nav = useNavStore();
</script>

<template>
  <MainHeaderBar />
  <MainNavBar
    v-if="nav.visible"
    :class="$style.navbar"
    class="z-10 md:sticky md:left-0"
  />
  <main :class="$style.main" class="flex-1 overflow-auto">
    <NuxtPage />
    <MainFooterBar />
  </main>
</template>

<style module>
.main {
  min-height: calc(100vh - var(--main-header-height));
}

@media (min-width: 768px) {
  .navbar {
    height: calc(100vh - var(--main-header-height));
    top: var(--main-header-height);
    width: var(--main-navbar-width);
  }

  .main {
    margin-left: var(--main-navbar-width);
  }
}
</style>
