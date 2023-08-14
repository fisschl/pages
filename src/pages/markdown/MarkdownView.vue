<script setup lang="ts">
import { MilkdownProvider } from "@milkdown/vue";
import MilkdownEdit from "./MilkdownEdit.vue";
import { ProsemirrorAdapterProvider } from "@prosemirror-adapter/vue";

const content = useLocalStorage(location.pathname + ":content", "");
const file = ref<File[]>([]);

const milk = ref<InstanceType<typeof MilkdownEdit>>();

const handleSelectFile = async () => {
  const item = file.value[0];
  if (!item) return;
  content.value = await item.text();
  milk.value?.reset();
};
</script>

<template>
  <MilkdownProvider>
    <ProsemirrorAdapterProvider>
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
    </ProsemirrorAdapterProvider>
  </MilkdownProvider>
</template>
