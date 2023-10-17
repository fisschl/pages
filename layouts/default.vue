<script setup lang="ts">
const nav = useNav();

onMounted(async () => {
  await nextTick();
  nav.visible = nav.lg;
});
whenever(
  () => !nav.lg,
  () => (nav.visible = false),
);
</script>

<template>
  <div :class="$style.page">
    <header
      class="gap-4 bg-gray-200/20 px-4 backdrop-blur dark:bg-gray-700/20"
      :class="$style.header"
    >
      <h1 class="flex-1"></h1>
      <NavToggleButton />
    </header>
    <div class="flex">
      <nav v-if="nav.visible && nav.lg">
        <NavBar :class="$style.navbar" class="py-4 pl-3" />
      </nav>
      <USlideover v-if="!nav.lg" v-model="nav.visible" side="left" class="w-52">
        <NavBar class="mx-4 my-3" />
      </USlideover>
      <slot />
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
  --navbar-width: 12rem;
}

.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
}

.navbar {
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  position: sticky;
  top: var(--header-height);
  width: var(--navbar-width);
}
</style>
