<script setup lang="ts">
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";

defineProps<{
  src?: string;
  alt?: string;
}>();

const element = ref<HTMLElement>();

onMounted(() => {
  if (!element.value) return;
  Fancybox.bind(element.value, "[data-fancybox]");
});

onBeforeUnmount(() => {
  if (!element.value) return;
  Fancybox.unbind(element.value);
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
