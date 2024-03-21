<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { objectUnRef } from "~/utils/util";

const { data: libraryOptions } = await useFetch("/api/poetry/facets");
const keyword = useRouteQuery<string>("keyword", "");
const library = useRouteQuery<string>("library", "");

const librarySet = computed(() => {
  return new Set(library.value.split(","));
});

const handleLibraryChange = (value: string, checked: boolean) => {
  const list = library.value.split(",").filter((item) => {
    return item.trim();
  });
  const set = new Set(list);
  if (checked) set.add(value);
  else set.delete(value);
  library.value = Array.from(set).join();
};

const query = computed(() => {
  return objectUnRef({
    keyword,
    library,
  });
});

const { data } = await useFetch<Record<string, string>[]>(
  "/api/poetry/poetries",
  { query: refDebounced(query, 200) },
);

const isAll = ref(false);

const loadMore = async () => {
  const offset = data.value?.length;
  if (!offset) return;
  const res = await $fetch("/api/poetry/poetries", {
    query: {
      ...query.value,
      offset,
    },
  });
  if (!res.length) {
    isAll.value = true;
    return;
  }
  if (!data.value) return;
  data.value = [...data.value, ...res];
};
</script>

<template>
  <UContainer class="pt-3">
    <UInput
      v-model="keyword"
      placeholder="搜索"
      icon="i-tabler-search"
      class="mb-4"
    />
    <div class="mb-3 flex flex-wrap gap-x-5 gap-y-3">
      <UCheckbox
        v-for="item in libraryOptions"
        :key="item.value"
        :model-value="librarySet.has(item.value)"
        @update:model-value="handleLibraryChange(item.value, $event)"
      >
        <template #label>
          {{ item.value }}
          <i class="italic text-gray-500 dark:text-gray-400">
            {{ item.count }}
          </i>
        </template>
      </UCheckbox>
    </div>
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <PoetryListItem
        v-for="item in data"
        :key="item.id"
        :item="item"
        class="py-3"
      />
    </ul>
    <div v-if="!isAll" class="mb-4 mt-10 flex justify-center">
      <UButton icon="i-tabler-arrow-down" block @click="loadMore" />
    </div>
  </UContainer>
</template>
