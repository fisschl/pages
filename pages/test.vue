<script setup lang="ts">
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

const ffmpeg = shallowRef<FFmpeg>();

onMounted(async () => {
  ffmpeg.value = new FFmpeg();
  ffmpeg.value.on("log", ({ message }) => {
    console.log(message);
  });
  const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core/dist/esm";
  await ffmpeg.value.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });
});

const handleClick = async () => {};
</script>

<template>
  <UContainer class="py-6">
    <UButton type="primary" @click="handleClick">测试</UButton>
  </UContainer>
</template>
