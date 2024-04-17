<script setup lang="ts">
import type { VerticalNavigationLink } from "#ui/types";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { Table } from "~/server/api/table/tables";

const headers = useRequestHeaders(["cookie"]);
const { data, refresh } = await useFetch<Table[]>("/api/table/tables", {
  headers,
});

const handleCreate = async () => {
  await $fetch("/api/table", {
    method: "POST",
    body: {},
  });
  await refresh();
};

const createItem: VerticalNavigationLink[] = [
  {
    label: "新建",
    icon: "i-tabler-plus",
    click: handleCreate,
  },
];

const show_time = (time: string) => {
  const date = parseISO(time);
  return formatDistanceToNowStrict(date, { locale: zhCN, addSuffix: true });
};

const links = computed(() => {
  if (!data.value) return [];
  const list = data.value.map<VerticalNavigationLink>((item) => {
    return {
      ...item,
      label: item.name,
      to: `https://bronya.world/table?_id=${item._id}`,
      create_at: show_time(item.create_at),
    };
  });
  return [createItem, list];
});
</script>

<template>
  <UContainer class="py-6">
    <UVerticalNavigation :links="links">
      <template #badge="{ link }">
        <span class="flex-1 pr-4 text-right text-xs">
          {{ link.create_at }}
        </span>
      </template>
    </UVerticalNavigation>
  </UContainer>
</template>
