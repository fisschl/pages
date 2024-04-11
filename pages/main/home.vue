<script setup lang="ts">
import { throttle } from "lodash-es";
import { z } from "zod";
import { useQuery } from "~/composables/route";

const { data: libraryOptions } = await useFetch("/api/poetry/facets");

const query_schema = z
  .object({
    keyword: z.string(),
    library: z.string(),
  })
  .partial();

const { query, setQuery } = useQuery(query_schema);

const library = computed(() => {
  const { library } = query.value;
  if (!library) return [];
  return library
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
});

const offset = ref(0);

const fetchData = async () => {
  return $fetch("/api/poetry/poetries", {
    query: {
      keyword: query.value.keyword,
      library: library.value.join(),
      offset: offset.value,
    },
  });
};

const fetchInit = async () => {
  offset.value = 0;
  return fetchData();
};

const { data, refresh } = await useAsyncData(fetchInit);
const refresh_throttled = throttle(refresh, 500);

const handleLibraryChange = async (value: string, checked: boolean) => {
  const c = new Set(library.value);
  if (checked) c.add(value);
  else c.delete(value);
  await setQuery({
    library: Array.from(c).join(","),
  });
  await refresh_throttled();
};

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

const updateKeyword = async (value: string) => {
  await setQuery({
    keyword: value,
  });
  await refresh_throttled();
};
</script>

<template>
  <UContainer class="pt-3">
    <div class="mb-4 flex gap-2">
      <UInput
        :modelValue="query.keyword"
        @update:modelValue="updateKeyword"
        placeholder="搜索"
        icon="i-tabler-search"
        class="flex-1"
      />
    </div>
    <div class="mb-3 flex flex-wrap gap-x-5 gap-y-3">
      <UCheckbox
        v-for="item in libraryOptions"
        :key="item.value"
        :model-value="library.includes(item.value)"
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
