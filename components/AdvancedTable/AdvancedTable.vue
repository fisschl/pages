<script setup lang="ts">
import { computed, toRef } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import type { UnRef } from "./utils";
import TableRow from "./TableRow.vue";
import table_style from "./table.module.css";
import HeaderCell from "./HeaderCell.vue";

const props = defineProps<{
  table: Table;
}>();

const { table } = props;

const container = toRef(table, "container");

type VirtualizerOptions = UnRef<Parameters<typeof useVirtualizer>[0]>;

const rows_virtual = useVirtualizer(
  computed<VirtualizerOptions>(() => {
    const { container, rows, ITEM_HEIGHT } = table;
    return {
      count: rows.length,
      getScrollElement: () => container || null,
      estimateSize: () => ITEM_HEIGHT,
      paddingStart: ITEM_HEIGHT,
      scrollPaddingStart: ITEM_HEIGHT,
      getItemKey: (i) => rows[i].id,
      initialRect: { width: 1920, height: 1080 },
    };
  }),
);

const columns_virtual = useVirtualizer(
  computed<VirtualizerOptions>(() => {
    const { container, columns, ITEM_HEIGHT } = table;
    return {
      horizontal: true,
      count: columns.length,
      getScrollElement: () => container || null,
      estimateSize: (i) => columns[i].width,
      paddingStart: ITEM_HEIGHT,
      scrollPaddingStart: ITEM_HEIGHT,
      getItemKey: (i) => columns[i].name,
      initialRect: { width: 1920, height: 1080 },
    };
  }),
);

const total_height = computed(() => rows_virtual.value.getTotalSize());
const total_width = computed(() => columns_virtual.value.getTotalSize());

const virtual_rows = computed(() => rows_virtual.value.getVirtualItems());
const virtual_columns = computed(() => columns_virtual.value.getVirtualItems());

const columns = toRef(table, "columns");
</script>

<template>
  <div ref="container" class="relative overflow-auto" :class="$style.container">
    <table
      class="relative block"
      :style="{
        width: `${total_width}px`,
        height: `${total_height}px`,
      }"
    >
      <thead class="sticky top-0 z-10 block">
        <tr
          class="flex"
          :style="{
            width: `${total_width}px`,
            height: `${table.ITEM_HEIGHT}px`,
          }"
        >
          <th
            class="sticky left-0 z-10 justify-center bg-[--header-background]"
            :style="{
              width: `${table.ITEM_HEIGHT}px`,
              height: `${table.ITEM_HEIGHT}px`,
            }"
            :class="table_style.cell"
          >
            <input type="checkbox" />
          </th>
          <HeaderCell
            v-for="column in virtual_columns"
            :key="columns[column.index].name"
            :style="{
              width: `${column.size}px`,
              height: `${table.ITEM_HEIGHT}px`,
              transform: `translateX(${column.start}px)`,
            }"
            :table="table"
            :virtual-column="column"
          />
        </tr>
      </thead>
      <tbody class="block">
        <TableRow
          v-for="row in virtual_rows"
          :key="row.key"
          :table="table"
          :style="{
            width: `${total_width}px`,
            height: `${row.size}px`,
            transform: `translateY(${row.start}px)`,
          }"
          :virtual-row="row"
          :virtual-columns="virtual_columns"
        />
      </tbody>
    </table>
  </div>
</template>

<style module>
.container {
  border: 1px solid var(--el-border-color);
  --header-background: var(--el-color-info-light-8);
}
</style>
