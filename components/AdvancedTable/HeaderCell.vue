<script setup lang="ts">
import type { VirtualItem } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import table_style from "./table.module.css";
import { computed } from "vue";

const props = defineProps<{
  table: Table;
  virtualColumn: VirtualItem;
}>();

const { table } = props;
const { index } = props.virtualColumn;
const column = computed(() => {
  return table.columns[index];
});
</script>

<template>
  <th
    :data-column="column.name"
    class="absolute left-0 top-0 z-0 bg-[--header-background]"
    :class="table_style.cell"
  >
    <component
      :is="column.headerComponent"
      v-if="column.headerComponent"
      :column="column"
    />
    <span class="mx-2 truncate">
      {{ column.title }}
    </span>
  </th>
</template>
