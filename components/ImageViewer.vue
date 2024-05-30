<script setup lang="ts">
defineProps<{
  src?: string;
  alt?: string;
}>();

const element = ref<HTMLElement>();

onMounted(async () => {
  if (!element.value) return;
  const { bind } = await import("~/utils/fancybox");
  bind(element.value);
});

onBeforeUnmount(async () => {
  if (!element.value) return;
  const { unbind } = await import("~/utils/fancybox");
  unbind(element.value);
});
</script>

<template>
  <img
    ref="element"
    :src="src"
    data-fancybox
    :alt="alt"
    class="cursor-zoom-in"
  />
</template>

<style module></style>
