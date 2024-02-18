<script setup lang="ts">
const navbar = useCookie("pages-nav-visible");
const isLargeScreen = useMediaQuery(`(min-width: 768px)`);

const handleUpdateNavbar = (value: boolean) => {
  navbar.value = value ? "true" : undefined;
};

onMounted(() => {
  handleUpdateNavbar(isLargeScreen.value);
});
</script>

<template>
  <div class="relative flex h-dvh w-screen flex-col overflow-auto">
    <MainHeaderBar
      :navbar="!!navbar"
      class="sticky top-0 z-20"
      @update:navbar="handleUpdateNavbar"
    />
    <div class="flex flex-1" :class="$style.mainContainer">
      <MainNavBar v-if="navbar" :class="$style.navbar" />
      <main class="flex-1 overflow-hidden">
        <NuxtPage />
      </main>
    </div>
    <MainFooterBar />
  </div>
</template>

<style module>
.mainContainer {
  flex-direction: column;
}

@media (min-width: 768px) {
  .mainContainer {
    flex-direction: row;
  }
}

.navbar {
  height: calc(100dvh - var(--main-header-height));
  top: var(--main-header-height);
  position: sticky;
  z-index: 10;
}

@media (min-width: 768px) {
  .navbar {
    width: var(--main-navbar-width);
  }
}
</style>
