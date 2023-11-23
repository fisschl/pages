<script setup lang="ts">
const nav = useNav();
const user = useUserStore();
</script>

<template>
  <header
    class="gap-4 bg-gray-200/20 px-4 backdrop-blur dark:bg-gray-700/20"
    :class="$style.header"
  >
    <UButton v-if="user.u" label="Button" color="gray">
      <template #leading>
        <UIcon name="i-tabler-user" style="font-size: 16px" />
      </template>
      {{ user.u?.name }}
    </UButton>
    <h1 class="flex-1"></h1>
    <UToggle
      v-model="nav.visible"
      on-icon="i-tabler-menu"
      off-icon="i-tabler-minimize"
    />
  </header>
</template>

<style module>
.header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 20;
}
</style>
