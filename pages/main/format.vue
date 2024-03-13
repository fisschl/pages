<script setup lang="ts">
import { debounce } from "lodash-es";
import { codeToHtml } from "shiki";
import { useLocalStorage } from "@vueuse/core";

const state = useLocalStorage("pages-format-state", {
  params: {
    text: "",
    extension: "json",
  },
  html: "",
});

const extensions = ["json", "yaml", "md", "vue", "html", "js", "ts", "css"];

const submit = debounce(async () => {
  const { params } = state.value;
  if (!state.value.params.text) return;
  const { text } = await $fetch("/api/format", {
    method: "POST",
    body: params,
  });
  params.text = text;
  state.value.html = await codeToHtml(text, {
    lang: params.extension,
    theme: "vitesse-dark",
  });
}, 500);
</script>

<template>
  <UContainer>
    <UForm :state="state.params" class="mb-4 px-4 pt-5" @submit.prevent>
      <UFormGroup label="扩展名" name="extension" class="mb-3 max-w-xs">
        <USelectMenu
          v-model="state.params.extension"
          :options="extensions"
          size="lg"
          @update:model-value="submit"
        />
      </UFormGroup>
      <UFormGroup label="文本" name="text">
        <UTextarea
          v-model="state.params.text"
          size="lg"
          :rows="5"
          @update:model-value="submit"
        />
      </UFormGroup>
    </UForm>
    <div v-if="state.params.text && state.html" class="relative mx-3">
      <CopyButton class="absolute right-2 top-2" :text="state.params.text" />
      <article
        class="prose max-w-none dark:prose-invert"
        v-html="state.html"
      ></article>
    </div>
  </UContainer>
</template>
