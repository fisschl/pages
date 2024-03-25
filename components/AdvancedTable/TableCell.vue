<script setup lang="ts">
import type { VirtualItem } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import table_style from "./table.module.css";
import { computed, toRef } from "vue";
import { get } from "lodash-es";

const props = defineProps<{
  table: Table;
  row: Record<string, string>;
  virtualColumn: VirtualItem;
}>();

const { table } = props;
const { cell_style } = table;

const rows = toRef(table, "rows");

const { index } = props.virtualColumn;
const column = computed(() => {
  return table.columns[index];
});
</script>

<template>
  <td
    :data-index="index"
    :data-row="row.id"
    :data-column="column.name"
    class="absolute left-0 top-0 z-0"
    :class="[table_style.cell, get(cell_style, [row.id, column.name])]"
  >
    <span class="mx-2 truncate">
      {{ rows[index][column.name] }}
    </span>
  </td>
</template>
