<script setup lang="ts">
import { debounce } from "lodash-es";

const params = reactive<{
  text?: string;
  extension?: string;
}>({});

const highlightHtml = ref<string>();

const submit = debounce(async () => {
  const { extension, text } = params;
  if (!extension || !text) return;
  const res = await $fetch("/api/format", {
    method: "POST",
    body: { extension, text },
  });
  params.text = res;
  const html = await $fetch("/api/highlight", {
    method: "POST",
    body: { text: res, lang: extension },
  });
  highlightHtml.value = html;
}, 500);

const { copy, copied } = useClipboard();
</script>

<template>
  <UForm :state="params" class="mx-3 mb-3 mt-5" @submit="submit">
    <UFormGroup label="扩展名" name="extension" class="mb-3 max-w-xs">
      <UInput v-model="params.extension" />
    </UFormGroup>
    <UFormGroup label="文本" name="text">
      <UTextarea v-model="params.text" :rows="5" @update:model-value="submit" />
    </UFormGroup>
  </UForm>
  <article
    v-if="params.text && highlightHtml"
    class="prose relative mx-3 max-w-none dark:prose-invert"
  >
    <UButton
      class="absolute right-2 top-2"
      variant="link"
      :icon="copied ? 'i-tabler-checks' : 'i-tabler-copy'"
      @click="copy(params.text)"
    />
    <div v-html="highlightHtml"></div>
  </article>
</template>

<style module></style>
