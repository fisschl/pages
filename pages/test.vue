<script setup lang="ts">
const status = ref<"recording" | "stopped">("stopped");

const recorder = shallowRef<MediaRecorder>();

const handleClick = async () => {
  const inputStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
  });
  recorder.value = new MediaRecorder(inputStream, {
    mimeType: "audio/webm",
  });

  const ws = new WebSocket("ws://localhost:8080");

  recorder.value.ondataavailable = async ({ data }) => {
    if (!data.size) return;
    ws.send(data);
  };

  recorder.value.start(500);
  status.value = "recording";
};

const clickStop = () => {
  recorder.value?.stop();
  status.value = "stopped";
};
</script>

<template>
  <UContainer class="py-6">
    <UButton type="primary" @click="handleClick"> 开始 </UButton>
    <UButton type="primary" @click="clickStop"> 停止 </UButton>
    {{ status }}
  </UContainer>
</template>
