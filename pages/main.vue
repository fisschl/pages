<script setup lang="ts">
onMounted(async () => {
  const { music, play } = await import("~/components/main/MusicButton.vue");
  music.value = {
    source: "https://static.bronya.world/opus/赴大荒.opus",
  };
  await play();
});
onBeforeUnmount(async () => {
  const { hide } = await import("~/components/main/MusicButton.vue");
  await hide();
});
</script>

<template>
  <MainHeader />
  <main>
    <NuxtPage />
  </main>
  <footer class="py-10 text-center text-sm text-gray-500">
    <a
      href="https://beian.miit.gov.cn/"
      target="_blank"
      class="hover:underline"
    >
      豫ICP备2023011860号-2
    </a>
  </footer>
</template>
