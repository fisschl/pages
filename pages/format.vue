<script setup lang="ts">
import { debounce } from "lodash-es";

const params = reactive<{
  text?: string;
  extension?: string;
}>({});

const submit = debounce(() => {
  const { extension, text } = params;
  if (!extension || !text) return;
  return $fetch("/api/format", {
    method: "POST",
    body: { extension, text },
  }).then((res) => {
    params.text = res;
  });
}, 500);
</script>

<template>
  <div class="w-full flex-1 px-4 py-3">
    <UForm :state="params" @submit="submit">
      <UFormGroup label="扩展名" name="extension" class="mb-3">
        <UInput v-model="params.extension" />
      </UFormGroup>
      <UFormGroup label="文本" name="text">
        <UTextarea
          v-model="params.text"
          resize
          autoresize
          @update:model-value="submit"
        />
      </UFormGroup>
    </UForm>
  </div>
</template>

<style module></style>
