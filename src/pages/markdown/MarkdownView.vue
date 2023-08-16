<script setup lang="ts">
import { MilkdownProvider } from "@milkdown/vue";
import MilkdownEdit from "./MilkdownEdit.vue";
import { IconDownload } from "@tabler/icons-vue";

const content = useLocalStorage("main-markdown-content", "");
const file = ref<File[]>([]);
const milk = ref<InstanceType<typeof MilkdownEdit>>();
const name = useLocalStorage("main-markdown-name", "");

const handleSelectFile = async () => {
  const item = file.value[0];
  if (!item) return;
  content.value = await item.text();
  name.value = item.name;
};

const handleDownload = async () => {
  const a = document.createElement("a");
  a.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(content.value),
  );
  a.setAttribute("download", name.value || "markdown.md");
  a.click();
};
</script>

<template>
  <article class="px-4">
    <header class="mt-2 flex gap-3">
      <VFileInput
        v-model="file"
        density="compact"
        accept=".txt,.md"
        @update:model-value="handleSelectFile"
      />
      <VBtn title="下载" :icon="IconDownload" @click="handleDownload" />
    </header>
    <MilkdownProvider>
      <MilkdownEdit ref="milk" v-model="content" class="pb-6" />
    </MilkdownProvider>
  </article>
</template>
