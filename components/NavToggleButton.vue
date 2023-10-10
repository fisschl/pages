<script setup lang="ts">
const nav = useNav();
</script>

<template>
  <UToggle
    v-model="nav.visible"
    on-icon="i-tabler-menu"
    off-icon="i-tabler-minimize"
  />
</template>
