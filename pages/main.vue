<script setup lang="ts">
const nav = useNav();
</script>

<template>
  <MainHeaderBar />
  <div class="md:flex">
    <MainNavBar
      v-if="nav.visible"
      :class="$style.navbar"
      class="z-10 md:sticky"
    />
    <main class="flex-1">
      <NuxtPage />
    </main>
  </div>
  <MainFooterBar />
</template>

<style module>
@media (min-width: 768px) {
  .navbar {
    height: calc(100vh - var(--header-height));
    top: var(--header-height);
    width: 12rem;
  }
}
</style>
