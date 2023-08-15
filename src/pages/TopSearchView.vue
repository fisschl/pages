<script setup lang="ts">
import { request, type Page } from "@/utils/fetch";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";

interface TopSearch {
  id: string;
  title: string;
  url: string;
  type: string;
  update_time: string;
}

const types = ref<string[]>([]);
request("/top-search-type").then((res) => {
  types.value = res;
});

interface Query extends Page {
  title?: string;
  type?: string;
  start_time?: string;
  end_time?: string;
}

const formData = reactive<Query>({ page: 1, size: 40 });
const loading = ref(false);
const total = ref(10);
const data = ref<TopSearch[]>([]);
const load = async () => {
  loading.value = true;
  return request("/top-search", {
    query: {
      ...formData,
    },
  })
    .then((res) => {
      data.value = res.list;
      total.value = res.total;
    })
    .finally(() => {
      loading.value = false;
    });
};

const refresh = () => {
  formData.page = 1;
  return load();
};

refresh();
</script>

<template>
  <main class="px-4 py-4">
    <VForm class="flex flex-wrap gap-3">
      <VTextField
        v-model="formData.title"
        variant="outlined"
        :clearable="true"
        label="标题"
        density="compact"
        @update:model-value="refresh"
      />
      <VAutocomplete
        v-model="formData.type"
        label="类型"
        density="compact"
        variant="outlined"
        :clearable="true"
        :items="types"
        @update:model-value="refresh"
      />
    </VForm>
    <VList v-if="data.length">
      <VListItem
        v-for="item in data"
        :key="item.id"
        :href="item.url"
        :title="item.title"
      />
    </VList>
    <template v-if="loading && !data.length">
      <VSkeletonLoader v-for="i in 20" :key="i" type="list-item" />
    </template>
    <VPagination
      v-model="formData.page"
      :length="Math.ceil(total / formData.size)"
      @update:model-value="load"
    />
  </main>
</template>
