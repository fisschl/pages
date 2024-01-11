<script setup lang="ts">
const props = defineProps<{
  item: Record<string, string>;
}>();

const to = computed(() => {
  const qs = new URLSearchParams({ id: props.item.id });
  return `/main/poetry?${qs}`;
});
</script>

<template>
  <article class="">
    <p class="mb-1 flex items-center gap-3 text-base">
      <span class="flex-1 truncate font-bold"> {{ item.title }} </span>
      <span class="text-sm text-gray-400"> {{ item.author }} </span>
      <span class="text-sm italic text-green-400"> {{ item.library }} </span>
    </p>
    <NuxtLink :to="to">
      <p
        :class="$style.content"
        class="text-sm text-zinc-600 dark:text-zinc-200"
        v-html="item.content"
      ></p>
    </NuxtLink>
  </article>
</template>

<style module>
.content em {
  font-style: normal;
  color: #007bff;
}
</style>
