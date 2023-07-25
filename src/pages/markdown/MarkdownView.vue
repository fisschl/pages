<script setup lang="ts">
import { MilkdownProvider } from "@milkdown/vue";
import MilkdownEdit from "./MilkdownEdit.vue";

const content = ref("");
const file = ref<File[]>([]);

const milk = ref<InstanceType<typeof MilkdownEdit>>();

const handleSelectFile = async () => {
  const item = file.value[0];
  if (!item) return;
  const text = await item.text();
  content.value = text;
  milk.value?.reset();
};
</script>

<template>
  <MilkdownProvider>
    <article class="flex h-screen flex-col px-4">
      <header class="mt-2 flex gap-3">
        <VFileInput
          v-model="file"
          density="compact"
          accept=".txt,.md"
          @update:model-value="handleSelectFile"
        />
      </header>
      <MilkdownEdit
        ref="milk"
        v-model:content="content"
        class="flex-1 overflow-auto pb-6"
      />
    </article>
  </MilkdownProvider>
</template>
