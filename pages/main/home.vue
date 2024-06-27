<script setup lang="ts">
import { z } from "zod";
import { useQuery } from "~/composables/route";

onMounted(async () => {
  const { music, play } = await import("~/components/main/MusicButton.vue");
  music.value = {
    source: "https://static.bronya.world/opus/赴大荒.opus",
  };
  await play();
});
onBeforeUnmount(async () => {
  const { hide } = await import("~/components/main/MusicButton.vue");
  await hide();
});

const { runWithContext } = useNuxtApp();

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

const params = computed(() => {
  return {
    keyword: query.value.keyword,
    library: library.value.join(),
  };
});

const { data, refresh } = await runWithContext(() => {
  return useFetch("/api/poetry/poetries", {
    query: params,
    deep: true,
    watch: false,
  });
});

const handleLibraryChange = async (value: string, checked: boolean) => {
  const pack = new Set(library.value);
  if (checked) pack.add(value);
  else pack.delete(value);
  await setQuery({
    library: Array.from(pack).join(","),
  });
  await refresh();
};

const isAll = ref(false);
const offset = ref(0);

const loadMore = async () => {
  offset.value = data.value?.length || 0;
  const res = await $fetch("/api/poetry/poetries", {
    query: {
      ...toValue(params),
      offset: offset.value,
    },
  });
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
  await refresh();
};

const { data: libraryOptions } = await useAsyncData("poetry/facets", () =>
  $fetch("/api/poetry/facets"),
);
</script>

<template>
  <UContainer class="pt-3">
    <div class="mb-4 flex gap-2">
      <UInput
        :model-value="query.keyword"
        placeholder="搜索"
        icon="i-tabler-search"
        class="flex-1"
        @update:model-value="updateKeyword"
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
      <UButton variant="soft" icon="i-tabler-arrow-down" @click="loadMore" />
    </div>
  </UContainer>
</template>
