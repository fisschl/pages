<script setup lang="ts">
import { v7 as uuid } from "uuid";
import { changeCaseOptions } from "~/utils/change-case";
import { pascalCase } from "change-case";
import { socket } from "~/composables/socket";

const request = reactivePick({
  text: "",
  case: "pascalCase",
});

const loading = ref(false);
const textResult = ref("");

const wordsResult = computed((): string[] => {
  const result = textResult.value.matchAll(/\w+/g);
  const caseItem = changeCaseOptions.find(
    (item) => item.value === request.case,
  );
  const action = caseItem?.action || pascalCase;
  return Array.from(result).map(([item]) => {
    return action(item);
  });
});

const effects: (() => unknown)[] = [];
const clearEffects = () => {
  effects.forEach((fn) => fn());
  effects.length = 0;
};

const startSend = () => {
  const text = request.text.trim();
  if (!text) return;
  request.text = text;
  clearEffects();
  const key = uuid();
  socket().emit("variables", {
    ...request,
    key,
  });
  loading.value = true;
  const handler = async (response: Record<string, any>) => {
    const { text, finished } = response;
    if (finished) loading.value = false;
    if (!text) return;
    textResult.value = text;
  };
  socket().on(key, handler);
  effects.push(() => socket().off(key, handler));
};

const clipboard = reactive(useClipboard());
</script>

<template>
  <URadioGroup
    v-model="request.case"
    class="radio-group mb-4 mt-5 px-4"
    :options="changeCaseOptions"
  />
  <UForm :state="request" class="mb-5 flex gap-3 px-4" @submit="startSend">
    <UFormGroup name="text" class="flex-1">
      <UInput v-model="request.text" size="md" placeholder="请输入描述" />
    </UFormGroup>
    <UButton type="submit" icon="i-tabler-sparkles"> 开始生成 </UButton>
  </UForm>
  <div class="flex flex-wrap gap-x-4 gap-y-3 px-4">
    <UButton
      v-for="item in wordsResult"
      :key="item"
      color="teal"
      variant="soft"
      class="word-result-button"
      @click="clipboard.copy(item)"
    >
      {{ item }}
      <UIcon
        v-if="clipboard.copied && clipboard.text === item"
        name="i-tabler-check"
      />
    </UButton>
    <UIcon
      v-if="loading"
      name="i-tabler-loader-2"
      style="font-size: 20px"
      class="animate-spin"
    />
  </div>
</template>

<style scoped>
.word-result-button {
  font-family: "Fira Code Variable", "Noto Sans SC Variable", monospace;
  font-size: 1rem;
}

.radio-group :deep(fieldset) {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  font-family: "Fira Code Variable", "Noto Sans SC Variable", monospace;
}
</style>
