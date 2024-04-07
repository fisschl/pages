<script setup lang="ts">
interface Worker {
  recognize: (img: string) => Promise<{
    data: { text: string };
  }>;
}

declare global {
  interface Window {
    Tesseract: {
      createWorker: (langs: string[]) => Promise<Worker>;
    };
  }
}

const worker = ref<Worker>();

onMounted(async () => {
  const { createWorker } = window.Tesseract;
  worker.value = await createWorker(["eng", "chi_sim"]);
  const res = await worker.value.recognize(
    "https://tesseract.projectnaptha.com/img/eng_bw.png",
  );
  console.log(res.data.text);
});
</script>

<template>
  <UContainer> </UContainer>
</template>
