<script setup lang="ts">
import type { NuxtLink } from "#build/components";
import type { article } from "@prisma/client";
import { formatDistanceToNow, parseJSON } from "date-fns/esm";
import { zhCN } from "date-fns/esm/locale";
import { pick } from "lodash-es";
import type { SerializeObject } from "nitropack";

const props = defineProps<{
  item: SerializeObject<Omit<article, "body">>;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const to = computed(() => ({
  path: "/editor",
  query: pick(props.item, "id"),
}));

const updateTime = computed(() => {
  return formatDistanceToNow(parseJSON(props.item.update_time), {
    locale: zhCN,
    addSuffix: true,
  });
});

const actions = [
  [
    {
      label: "删除",
      icon: "i-tabler-trash",
      click: async () => {
        await $fetch("/api/article", {
          method: "DELETE",
          query: pick(props.item, "id"),
        });
        emit("delete");
      },
    },
  ],
];
</script>

<template>
  <NuxtLink
    :to="to"
    class="flex items-center gap-2 rounded px-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900"
  >
    <span class="mr-2 flex-1">
      {{ item.name }}
    </span>
    <span class="mr-4 text-sm text-gray-500 dark:text-gray-400">
      {{ updateTime }}
    </span>
    <UDropdown mode="hover" :items="actions">
      <UButton color="gray" variant="ghost" size="sm" icon="i-tabler-dots" />
    </UDropdown>
  </NuxtLink>
</template>

<style module></style>
