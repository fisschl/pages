<script setup lang="ts">
import { reactive } from "vue";
import { Table } from "~/components/AdvancedTable/schema";
import AdvancedTable from "~/components/AdvancedTable/AdvancedTable.vue";

const table = reactive(new Table());

table.columns = Array.from({ length: 100 }).map((item, index) => {
  return {
    name: `c_${index + 1}`,
    title: `第 ${index + 1} 列`,
    width: 120,
  };
});

table.rows = Array.from({ length: 1000 }).map((item, index) => {
  const row: Record<string, string> = {};
  for (const item of table.columns) {
    row.id = `_${index}`;
    row[item.name] = `文本 ${item.name} ${index + 1}`;
  }
  return row;
});
</script>

<template>
  <div class="flex h-screen w-screen flex-col p-5">
    <AdvancedTable class="flex-1" :table="table" />
  </div>
</template>
