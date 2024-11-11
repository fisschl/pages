<script setup lang="ts">
import { v7 as uuid } from "uuid";
import { changeCaseOptions } from "~/utils/change-case";
import type { NamingRequest } from "~/server/api/variables";

const request = reactive<NamingRequest>({
  text: "",
  case: "pascalCase",
});

const namingURL = computed(() => {
  if (typeof window === "undefined") return;
  const scheme = location.protocol.startsWith("https") ? "wss" : "ws";
  return `${scheme}://${location.host}/api/variables`;
});

const loading = ref(false);

const textResult = ref("");

const wordsResult = computed(() => {
  const result = textResult.value.matchAll(/\w+/g);
  const action = changeCase[request.case];
  return Array.from(result).map(([item]) => {
    const value = action(item);
    if (typeof value !== "string") return item;
    return value;
  });
});

const { send } = useWebSocket(namingURL, {
  onMessage(ws, { data }) {
    if (!data) return;
    const response = JSON.parse(data);
    if (response.key !== request.key) return;
    if (response.finished) loading.value = false;
    if (!response.text) return;
    console.info(response.text);
    textResult.value = response.text;
  },
  autoReconnect: true,
});

const startSend = () => {
  const text = request.text.trim();
  if (!text) return;
  request.text = text;
  request.key = uuid();
  send(JSON.stringify(request));
  loading.value = true;
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
