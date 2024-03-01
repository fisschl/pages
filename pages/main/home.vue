<script lang="ts">
export const useLibraryStore = defineStore("library", () => {
  const state = reactive<{
    keyword?: string;
    library?: string[];
  }>({});

  return { state };
});
</script>

<script setup lang="ts">
const { data: libraryOptions } = await useFetch("/api/poetry/facets");

const { state } = useLibraryStore();

const handleLibraryChange = (value: string, checked: boolean) => {
  const set = new Set(state.library);
  if (checked) set.add(value);
  else set.delete(value);
  state.library = [...set];
};

const query = computed(() => {
  return {
    ...state,
    library: state.library?.join(),
  };
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
  <div class="mx-6 pb-3 pt-4">
    <UInput
      v-model="state.keyword"
      placeholder="搜索"
      icon="i-tabler-search"
      class="mb-4"
    />
    <div class="mb-3 flex flex-wrap gap-x-5 gap-y-3">
      <UCheckbox
        v-for="item in libraryOptions"
        :key="item.value"
        :model-value="state.library?.includes(item.value)"
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
    <div v-if="!isAll" class="my-4 flex justify-center">
      <UButton
        icon="i-tabler-loader-3"
        color="gray"
        class="!px-6"
        @click="loadMore"
      >
        加载更多
      </UButton>
    </div>
  </div>
</template>
