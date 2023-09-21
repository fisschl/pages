<script setup lang="ts">
const handleLinkClick = () => {
  if (lg.value) return;
  nav.value.isNavVisible = false;
};

const links = reactive([
  {
    label: "主页",
    icon: "i-tabler-home",
    to: "/",
    click: handleLinkClick,
  },
  {
    label: "Markdown",
    icon: "i-tabler-markdown",
    to: "/md",
    click: handleLinkClick,
  },
  {
    label: "AI",
    icon: "i-tabler-brand-openai",
    to: "https://gpt.fisschl.world",
    click: handleLinkClick,
  },
  {
    label: "博客",
    icon: "i-tabler-brand-blogger",
    to: "https://memos.fisschl.world",
    click: handleLinkClick,
  },
  {
    label: "共享文件",
    icon: "i-tabler-device-floppy",
    to: "https://store.fisschl.world",
    click: handleLinkClick,
  },
]);
const nav = useNav();
const lg = useMediaQuery(LG);
watch(lg, (lg) => {
  nav.value.isNavVisible = lg;
});
</script>

<template>
  <div>
    <header
      class="sticky top-0 flex gap-4 bg-gray-200/20 px-4 py-3 backdrop-blur dark:bg-gray-700/20"
    >
      <h1 class="flex-1"></h1>
      <UToggle
        v-model="nav.isNavVisible"
        on-icon="i-tabler-menu"
        off-icon="i-tabler-minimize"
      />
    </header>
    <div class="flex">
      <nav v-if="nav.isNavVisible && lg">
        <UVerticalNavigation
          :links="links"
          class="sticky top-14 w-48 py-4 pl-3"
          :class="$style.nav"
        />
      </nav>
      <USlideover
        v-if="!lg"
        v-model="nav.isNavVisible"
        side="left"
        class="w-52"
      >
        <UVerticalNavigation class="mx-4 my-3" :links="links" />
      </USlideover>
      <slot />
    </div>
  </div>
</template>

<style module>
.nav {
  height: calc(100vh - 4rem);
  overflow: auto;
}
</style>
