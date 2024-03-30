<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

const { data: libraryOptions } = await useFetch("/api/poetry/facets");
const keyword = useRouteQuery<string>("keyword", "");
const library = useRouteQuery<string>("library", "");

const librarySet = computed(() => {
  return new Set(library.value.split(","));
});

const handleLibraryChange = async (value: string, checked: boolean) => {
  const list = library.value.split(",").filter((item) => {
    return item.trim();
  });
  const set = new Set(list);
  if (checked) set.add(value);
  else set.delete(value);
  library.value = Array.from(set).join();
};

const offset = ref(0);

const fetchData = async () => {
  return $fetch("/api/poetry/poetries", {
    query: {
      keyword: keyword.value,
      library: library.value,
      offset: offset.value,
    },
  });
};

const fetchInit = async () => {
  offset.value = 0;
  return fetchData();
};

const { data } = await useAsyncData(fetchInit, { watch: [keyword, library] });

const isAll = ref(false);

const loadMore = async () => {
  offset.value = data.value?.length || 0;
  const res = await fetchData();
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
      <UButton
        variant="soft"
        icon="i-tabler-arrow-down"
        block
        @click="loadMore"
      />
    </div>
  </UContainer>
</template>
