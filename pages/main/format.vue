<script setup lang="ts">
import { debounce } from "lodash-es";

const params = useLocalStorage<{
  text?: string;
  extension?: string;
}>("format-params", {});

const extensions = ["json", "yaml", "md", "vue", "html", "js", "ts", "css"];

const highlightHtml = ref<string>();

const submit = debounce(async () => {
  let { extension, text } = params.value;
  extension = extension?.trim().toLowerCase();
  text = text?.trim();
  if (!extension || !text) return;
  text = await $fetch("/api/format", {
    method: "POST",
    body: { extension, text },
  });
  params.value.text = text;
  const { code } = await $fetch("/api/highlight", {
    method: "POST",
    body: { text, lang: extension },
  });
  highlightHtml.value = code;
}, 500);

const { copy, copied } = useClipboard();
</script>

<template>
  <UForm :state="params" class="mx-3 mb-3 mt-5" @submit.prevent>
    <UFormGroup label="扩展名" name="extension" class="mb-3 max-w-xs">
      <USelectMenu
        v-model="params.extension"
        :options="extensions"
        @update:model-value="submit"
      />
    </UFormGroup>
    <UFormGroup label="文本" name="text">
      <UTextarea v-model="params.text" :rows="5" @update:model-value="submit" />
    </UFormGroup>
  </UForm>
  <div v-if="params.text && highlightHtml" class="relative mx-3">
    <UButton
      class="absolute right-2 top-2"
      variant="link"
      :icon="copied ? 'i-tabler-checks' : 'i-tabler-copy'"
      @click="copy(params.text)"
    />
    <article
      class="prose max-w-none dark:prose-invert"
      v-html="highlightHtml"
    ></article>
  </div>
</template>
