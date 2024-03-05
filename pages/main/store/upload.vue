<script setup lang="ts">
import { useUserStore } from "~/composables/user";
import { baseName, useOssStore } from "~/composables/oss";
import { useRouteQuery } from "@vueuse/router";

const user = useUserStore();
const oss = useOssStore();

const path = useRouteQuery("path", "/");
const dir = ref<string>("");

const { open, onChange } = useFileDialog({
  multiple: true,
});
onChange((files) => {
  console.log(files);
});
</script>

<template>
  <UContainer class="py-6">
    <UBadge class="mb-3" color="violet"> 上传到： {{ path + dir }} </UBadge>
    <UInput v-model="dir" placeholder="上传到子目录下" class="mb-3" />
    <UButton @click="open">
      <UIcon name="i-tabler-folder" style="font-size: 1.1rem" />
      选择文件
    </UButton>
  </UContainer>
</template>

<style module></style>
