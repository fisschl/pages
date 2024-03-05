<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import { baseName, useOssStore } from "~/composables/oss";

const user = useUserStore();
const oss = useOssStore();
const dir = ref<string>();
</script>

<template>
  <UContainer class="py-6">
    <UInput v-model="dir" placeholder="上传到子目录下" class="mb-3" />
    <UButton>
      <UIcon name="i-tabler-folder" style="font-size: 1.1rem" />
      选择文件
    </UButton>
  </UContainer>
</template>

<style module></style>
