<script setup lang="ts">
const nav = useNav();
const handleLinkClick = () => {
  nav.value.isDrawerNavVisible = false;
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
  {
    label: "代码格式化",
    icon: "i-tabler-braces",
    to: "/format",
    click: handleLinkClick,
  },
]);
const lg = useMediaQuery(LG);
const handleChangeNavVisible = (value: boolean) => {
  if (lg.value) nav.value.isVerticalNavVisible = value;
  else nav.value.isDrawerNavVisible = value;
};
</script>

<template>
  <div>
    <header
      class="sticky top-0 flex gap-4 bg-gray-200/20 px-4 py-3 backdrop-blur dark:bg-gray-700/20"
    >
      <h1 class="flex-1"></h1>
      <ClientOnly>
        <UToggle
          :model-value="lg ? nav.isVerticalNavVisible : nav.isDrawerNavVisible"
          on-icon="i-tabler-menu"
          off-icon="i-tabler-minimize"
          @update:model-value="handleChangeNavVisible"
        />
      </ClientOnly>
    </header>
    <div class="flex">
      <nav v-if="nav.isVerticalNavVisible" class="hidden lg:block">
        <UVerticalNavigation
          :links="links"
          class="sticky top-14 w-48 py-4 pl-3"
          :class="$style.nav"
        />
      </nav>
      <USlideover
        v-model="nav.isDrawerNavVisible"
        side="left"
        class="w-52 lg:hidden"
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
