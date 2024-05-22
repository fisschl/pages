<script setup lang="ts">
import type { Poetry } from "~/server/api/poetry/poetries";

const props = defineProps<{
  item: Poetry;
}>();

const to = computed(() => {
  const qs = new URLSearchParams({ id: props.item.id });
  return `/main/poetry?${qs}`;
});
</script>

<template>
  <article class="">
    <div class="mb-1 flex items-center gap-3 text-base">
      <h4 class="flex-1 truncate font-bold">
        <NuxtLink :to="to">
          {{ item.title }}
        </NuxtLink>
      </h4>
      <span class="text-sm text-gray-400"> {{ item.author }} </span>
      <span class="text-sm italic text-green-400"> {{ item.library }} </span>
    </div>
    <p
      :class="$style.content"
      class="text-sm text-zinc-600 dark:text-zinc-200"
      v-html="item.content"
    />
  </article>
</template>

<style module>
.content em {
  font-style: normal;
  color: #007bff;
}
</style>
