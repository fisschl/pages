<script setup lang="ts">
const fileDialog = useFileDialog();
</script>

<template>
  <UContainer class="my-6">
    <UButton @click="fileDialog.open">Click me</UButton>
  </UContainer>
</template>

<style module></style>
