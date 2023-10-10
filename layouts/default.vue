<script setup lang="ts">
const nav = useNav();
const lg = useMediaQuery(LG);
const handleChangeNavVisible = (value: boolean) => {
  if (lg.value) nav.value.isVerticalNavVisible = value;
  else nav.value.isDrawerNavVisible = value;
};
</script>

<template>
  <div :class="$style.page">
    <header
      class="gap-4 bg-gray-200/20 px-4 backdrop-blur dark:bg-gray-700/20"
      :class="$style.header"
    >
      <h1 class="flex-1"></h1>
      <UToggle
        :model-value="lg ? nav.isVerticalNavVisible : nav.isDrawerNavVisible"
        on-icon="i-tabler-menu"
        off-icon="i-tabler-minimize"
        @update:model-value="handleChangeNavVisible"
      />
    </header>
    <div class="flex">
      <ClientOnly>
        <nav v-if="nav.isVerticalNavVisible && lg">
          <NavBar :class="$style.navbar" class="py-4 pl-3" />
        </nav>
        <USlideover
          v-if="!lg"
          v-model="nav.isDrawerNavVisible"
          side="left"
          class="w-52 lg:hidden"
        >
          <NavBar class="mx-4 my-3" />
        </USlideover>
      </ClientOnly>
      <slot />
    </div>
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
