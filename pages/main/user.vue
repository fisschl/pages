<script setup lang="ts">
import { pick } from "lodash-es";

const { open, onChange } = useFileDialog({ accept: "image/*" });

onChange(async (files) => {
  if (!files?.length) return;
  const file = files[0];
  const { url } = await $fetch("/api/profile_upload", {
    query: pick(file, ["name", "type"]),
  });
  await $fetch(url, {
    method: "PUT",
    body: file,
  });
});
</script>

<template>
  <UButton @click="open"> 上传头像 </UButton>
</template>

<style module></style>
