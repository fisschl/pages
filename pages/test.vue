<script setup lang="ts">
import type { VNode } from "~/utils/snabbdom";

const container = ref<HTMLElement>();
const lastVNode = ref<VNode>();

const test1 = async () => {
  const html = `
  <div>123</div>
  `;
  const { patch, parse } = await import("~/utils/snabbdom");
  const node = parse(html);
  lastVNode.value = patch(lastVNode.value || container.value!, node);
};
const test2 = async () => {
  const html = `
  <div>123</div>
  <p>456</p>
  `;
  const { patch, parse } = await import("~/utils/snabbdom");
  const node = parse(html);
  lastVNode.value = patch(lastVNode.value!, node);
};
</script>

<template>
  <UContainer class="py-4">
    <div class="flex gap-3">
      <UButton @click="test1"> 1 </UButton>
      <UButton @click="test2"> 2 </UButton>
    </div>
    <article ref="container"></article>
  </UContainer>
</template>
