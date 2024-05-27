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

onMounted(async () => {
  const theme =
    colorMode.value === "dark"
      ? "amap://styles/dark"
      : "amap://styles/whitesmoke";
  const map = new AMap.Map("container", {
    zoom: 12,
    mapStyle: theme,
  });
});
</script>

<template>
  <main>
    <div class="h-dvh" id="container"></div>
  </main>
</template>

<style module></style>
