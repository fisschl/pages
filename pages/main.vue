<script setup lang="ts">
import { useNavStore } from "~/composables/nav";

const nav = useNavStore();
const isLargeScreen = useMediaQuery(`(min-width: 768px)`);

onMounted(() => {
  if (nav.cookie) return;
  nav.cookie = isLargeScreen.value.toString();
});
</script>

<template>
  <MainHeaderBar :class="$style.header" />
  <MainNavBar v-if="nav.visible" :class="$style.navbar" />
  <main :class="{ [$style.main]: true, [$style.mainWithNav]: nav.visible }">
    <NuxtPage />
    <MainFooterBar />
  </main>
</template>

<style module>
.header {
  position: fixed;
  top: 0;
  z-index: 20;
}

.navbar {
  height: calc(100vh - var(--main-header-height));
  top: var(--main-header-height);
  position: fixed;
  width: 100%;
  z-index: 10;
}

.main {
  margin-top: var(--main-header-height);
}

@media (min-width: 768px) {
  .navbar {
    width: var(--main-navbar-width);
  }

  .mainWithNav {
    margin-left: var(--main-navbar-width);
  }
}
</style>
