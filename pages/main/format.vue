<script setup lang="ts">
import { debounce } from "lodash-es";

const params = reactive({
  text: "",
  extension: "json",
});

const result = ref("");

const extensions = ["json", "yaml", "md", "vue", "html", "js", "ts", "css"];

const submit = debounce(async () => {
  if (!params.text) return;
  const { text, html } = await $fetch("/api/format", {
    method: "POST",
    body: params,
  });
  params.text = text;
  result.value = html;
}, 500);
</script>

<template>
  <UContainer>
    <UForm :state="params" class="mb-4 pt-5" @submit.prevent>
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
    <article
      v-if="params.text && result"
      class="prose max-w-none dark:prose-invert"
      v-html="result"
    />
  </UContainer>
</template>
