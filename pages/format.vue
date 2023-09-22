<script setup lang="ts">
import { debounce } from "lodash-es";

const params = reactive<{
  text?: string;
  filepath?: string;
}>({});

const submit = debounce(() => {
  const { filepath, text } = params;
  if (!filepath || !text) return;
  return $fetch("/api/format", {
    method: "POST",
    body: {
      text,
      filepath: filepath.includes(".") ? filepath : `*.${filepath}`,
    },
  }).then((res) => {
    params.text = res;
  });
}, 500);
</script>

<template>
  <div class="w-full flex-1 px-4 py-3">
    <UForm :state="params" @submit="submit">
      <UFormGroup label="文件名/扩展名" name="filepath" class="mb-3">
        <UInput v-model="params.filepath" />
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
