<script setup lang="ts">
import { debounce } from "lodash-es";

const params = useLocalStorage("format-params", {
  text: "",
  extension: "json",
});

const extensions = ["json", "yaml", "md", "vue", "html", "js", "ts", "css"];

const highlightHtml = ref<string>();

const submit = debounce(async () => {
  if (!params.value.text) return;
  const { text } = await $fetch("/api/format", {
    method: "POST",
    body: params.value,
  });
  params.value.text = text;
  const { code } = await $fetch("/api/highlight", {
    method: "POST",
    body: { text, lang: params.value.extension },
  });
  highlightHtml.value = code;
}, 500);
</script>

<template>
  <UForm :state="params" class="mb-4 px-4 pt-5" @submit.prevent>
    <UFormGroup label="扩展名" name="extension" class="mb-3 max-w-xs">
      <USelectMenu
        v-model="params.extension"
        :options="extensions"
        size="lg"
        @update:model-value="submit"
      />
    </UFormGroup>
    <UFormGroup label="文本" name="text">
      <UTextarea
        v-model="params.text"
        size="lg"
        :rows="5"
        @update:model-value="submit"
      />
    </UFormGroup>
  </UForm>
  <div v-if="params.text && highlightHtml" class="relative mx-3">
    <CopyButton class="absolute right-2 top-2" :text="params.text" />
    <article
      class="prose max-w-none dark:prose-invert"
      v-html="highlightHtml"
    ></article>
  </div>
</template>
