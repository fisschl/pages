<script setup lang="ts">
import { useQRCode } from "@vueuse/integrations/useQRCode";

const text = ref("https://ys.mihoyo.com");
const qrcode = useQRCode(text);
</script>

<template>
  <UContainer as="article" class="py-6">
    <div class="mb-8 flex">
      <UInput v-model="text" size="lg" class="flex-1" />
    </div>
    <img v-if="qrcode" class="mx-auto size-40" :src="qrcode" alt="QR Code" />
  </UContainer>
</template>
