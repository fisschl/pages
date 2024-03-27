<script setup lang="ts">
import type { VirtualItem } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import table_style from "./table.module.css";
import { computed } from "vue";
import { get } from "lodash-es";

const props = defineProps<{
  table: Table;
  row: Record<string, string>;
  virtualRow: VirtualItem;
  virtualColumn: VirtualItem;
}>();

const { table } = props;
const { cell_style } = table;

const { index } = props.virtualColumn;
const column = computed(() => {
  return table.columns[index];
});
</script>

<template>
  <td
    :data-row="virtualRow.index"
    :data-column="virtualColumn.index"
    class="absolute left-0 top-0 z-0"
    :class="[table_style.cell, get(cell_style, [row.id, column.name])]"
  >
    <component
      :is="column.component"
      v-if="column.component"
      :row="row"
      :column="column"
    />
    <span class="mx-2 truncate">
      {{ row[column.name] }}
    </span>
  </td>
</template>
