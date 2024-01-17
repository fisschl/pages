<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import { debounce } from "lodash-es";
import { useOptionsQuery } from "~/utils/query";

const { data: libraryOptions } = await useFetch("/api/poetry_facets");

const keyword = useRouteQuery("keyword", "");
const [library, setLibrary] = useOptionsQuery("library");

const handleLibraryChange = (value: string, checked: boolean) => {
  const set = new Set(library.value);
  if (checked) set.add(value);
  else set.delete(value);
  return setLibrary(set);
};

const query = computed(() => ({
  keyword: keyword.value,
  library: library.value,
}));

const { data } = useFetch<Record<string, string>[]>("/api/poetries", {
  query: refDebounced(query, 200),
});

const isAll = ref(false);

const loadMore = async () => {
  const offset = data.value?.length;
  if (!offset) return;
  const res = await $fetch("/api/poetries", {
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

const loadingElement = ref<HTMLDivElement>();
const isBottom = useElementVisibility(loadingElement);
whenever(isBottom, debounce(loadMore, 200));
</script>

<template>
  <div class="mx-6 pb-3 pt-4">
    <UInput v-model="keyword" class="mb-4" />
    <div class="mb-3 flex flex-wrap gap-x-5 gap-y-3">
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
    <ul class="divide-y divide-gray-100 dark:divide-gray-800">
      <PoetryListItem
        v-for="item in data"
        :key="item.id"
        :item="item"
        class="py-3"
      />
    </ul>
    <div v-if="!isAll" ref="loadingElement" class="my-8 flex justify-center">
      <UIcon
        name="i-tabler-loader-2"
        style="font-size: 1.5rem"
        class="animate-spin text-gray-400"
      />
    </div>
  </div>
</template>
