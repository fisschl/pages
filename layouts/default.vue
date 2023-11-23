<script setup lang="ts">
const nav = useNav();
</script>

<template>
  <div :class="$style.page">
    <HeaderBar />
    <div class="md:flex">
      <NavBar
        v-if="nav.visible"
        :class="$style.navbar"
        class="z-10 md:sticky"
      />
      <slot></slot>
    </div>
    <footer class="my-10 text-center text-sm text-gray-500">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        class="hover:underline"
      >
        豫ICP备2023011860号-1
      </a>
    </footer>
  </div>
</template>

<style module>
.page {
  --header-height: 3.5rem;
}

@media (min-width: 768px) {
  .navbar {
    height: calc(100vh - var(--header-height));
    top: var(--header-height);
    width: 12rem;
  }
}
</style>
