<script setup lang="ts">
import "@amap/amap-jsapi-types";

useHead({
  script: [
    {
      src: "https://webapi.amap.com/loader.js",
    },
    {
      src: "https://static.bronya.world/script/amap.js",
      type: "module",
    },
  ],
});

const colorMode = useColorMode();

const amap = shallowRef<AMap.Map>();

onMounted(async () => {
  const theme =
    colorMode.value === "dark"
      ? "amap://styles/dark"
      : "amap://styles/whitesmoke";
  amap.value = new AMap.Map("container", {
    zoom: 12,
    mapStyle: theme,
  });
});
onBeforeUnmount(() => {
  amap.value?.destroy();
});
</script>

<template>
  <main class="relative h-dvh">
    <div id="container" class="h-full"></div>
  </main>
</template>

<style module></style>
