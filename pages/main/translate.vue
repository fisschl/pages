<script setup lang="ts">
import { debounce } from "lodash-es";

const lang_list = [
  {
    label: "简体中文",
    value: "zh-CHS",
  },
  {
    label: "英语",
    value: "en",
  },
  {
    label: "日语",
    value: "ja",
  },
];

const from_list = [
  {
    label: "自动识别",
    value: "auto",
  },
  ...lang_list,
];

const from = ref("auto");
const to = ref("zh-CHS");

const input_text = ref("");

const result = ref("");

const translate = debounce(async () => {
  if (!input_text.value) return (result.value = "");
  const res = await $fetch("/api/youdao/translate", {
    method: "POST",
    body: { text: input_text.value, from: from.value, to: to.value },
  });
  result.value = res.text;
}, 500);

watch(input_text, translate);
</script>

<template>
  <UContainer class="my-6">
    <div class="mb-3 flex items-center gap-3">
      <USelectMenu
        v-model="from"
        :options="from_list"
        value-attribute="value"
        option-attribute="label"
        @change="translate"
      />
      <UIcon name="i-tabler-arrows-shuffle" />
      <USelectMenu
        v-model="to"
        :options="lang_list"
        value-attribute="value"
        option-attribute="label"
        @change="translate"
      />
    </div>
    <UTextarea
      v-model="input_text"
      size="lg"
      autoresize
      placeholder="请输入要翻译的文本"
      class="mb-3"
    />
    <article class="prose max-w-none p-2 dark:prose-invert">
      {{ result }}
    </article>
  </UContainer>
</template>

<style module></style>
