<script setup lang="ts">
import {
  camelCase,
  constantCase,
  kebabCase,
  pascalCase,
  pathCase,
  snakeCase,
} from "change-case";

const types = [
  {
    func: camelCase,
    name: "helloWorld",
  },
  {
    func: constantCase,
    name: "HELLO_WORLD",
  },
  {
    func: kebabCase,
    name: "hello-world",
  },
  {
    func: pascalCase,
    name: "HelloWorld",
  },
  {
    func: pathCase,
    name: "hello/world",
  },
  {
    func: snakeCase,
    name: "hello_world",
  },
];
const input = ref("hello world");
const type = ref("helloWorld");

const result = computed(() => {
  const item = types.find((item) => item.name === type.value);
  if (!item) return;
  return item.func(input.value);
});

const names = computed(() => {
  return types.map((item) => item.name);
});
</script>

<template>
  <UContainer as="article" class="py-6">
    <div class="mb-4 flex gap-2">
      <USelectMenu
        v-model="type"
        style="width: 10rem"
        size="lg"
        :options="names"
      />
      <UInput v-model="input" size="lg" class="flex-1" />
    </div>
    <article class="prose relative max-w-none dark:prose-invert">
      <pre>{{ result }}</pre>
      <CopyButton class="absolute right-2 top-2" :text="result" />
    </article>
  </UContainer>
</template>
