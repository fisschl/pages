<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { useOptionsQuery } from "~/utils/query";

const { data: libraryOptions } = await useFetch("/api/poetry_facets");

const keyword = useRouteQuery("keyword", "");
const [library, setLibrary] = useOptionsQuery("library");

const handleLibraryChange = (value: string, checked: boolean) => {
  const set = new Set(library.value);
  if (checked) set.add(value);
  else set.delete(value);
  return setLibrary(Array.from(set));
};

const query = computed(() => ({
  keyword: keyword.value,
  library: library.value,
}));

const { data } = useFetch<Record<string, string>[]>("/api/poetries", {
  query: refDebounced(query, 200),
});
</script>

<template>
  <div class="mx-4 pb-3 pt-4">
    <UInput v-model="keyword" class="mb-4" />
    <div class="flex flex-wrap gap-x-5 gap-y-3">
      <UCheckbox
        v-for="item in libraryOptions"
        :key="item.value"
        :model-value="library.includes(item.value)"
        name="library"
        :label="item.value"
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
  </div>
  <div class="divide-y divide-gray-100 dark:divide-gray-800">
    <Suspense v-for="item in data" :key="item.id">
      <PoetryListItem :item="item" class="mx-4 py-3" />
    </Suspense>
  </div>
</template>
