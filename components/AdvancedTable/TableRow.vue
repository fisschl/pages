<script setup lang="ts">
import type { VirtualItem } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import table_style from "./table.module.css";
import { computed, toRef } from "vue";
import TableCell from "./TableCell.vue";
import { get } from "lodash-es";

const props = defineProps<{
  table: Table;
  virtualRow: VirtualItem;
  virtualColumns: VirtualItem[];
}>();

const { table } = props;
const { row_style } = table;

const columns = toRef(table, "columns");

const row = computed(() => {
  const { index } = props.virtualRow;
  return table.rows[index];
});
</script>

<template>
  <tr
    class="absolute left-0 top-0 z-0 flex"
    :style="{
      height: `${virtualRow.size}px`,
      transform: `translateY(${virtualRow.start}px)`,
    }"
    :class="get(row_style, row.id)"
  >
    <td
      class="sticky left-0 z-10 justify-center bg-[--header-background]"
      :style="{
        width: `${table.ITEM_HEIGHT}px`,
        height: `${virtualRow.size}px`,
      }"
      :class="[table_style.cell, get(row_style, row.id)]"
    >
      <input type="checkbox" />
    </td>
    <TableCell
      v-for="column in virtualColumns"
      :key="columns[column.index].name"
      :table="table"
      :style="{
        width: `${column.size}px`,
        height: `${virtualRow.size}px`,
        transform: `translateX(${column.start}px)`,
      }"
      :row="row"
      :virtual-row="virtualRow"
      :virtual-column="column"
    />
  </tr>
</template>
