<script setup lang="ts">
import { computed, toRef } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";
import { Table } from "./schema";
import type { UnRef } from "./utils";

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
    };
  }),
);

const total_height = computed(() => rows_virtual.value.getTotalSize());
const total_width = computed(() => columns_virtual.value.getTotalSize());

const virtual_rows = computed(() => rows_virtual.value.getVirtualItems());
const virtual_columns = computed(() => columns_virtual.value.getVirtualItems());

const columns = toRef(table, "columns");

const { width, height } = useElementSize(container);
</script>

<template>
  <div ref="container" class="relative overflow-auto" :class="$style.container">
    <div
      class="sticky left-0 top-0"
      :style="{
        width: `${width}px`,
        height: `${height}px`,
      }"
    >
      天下为公
    </div>
    <p
      class="m-0 p-0"
      :style="{
        width: `${total_width}px`,
        height: `${total_height}px`,
      }"
    ></p>
  </div>
</template>

<style module>
.container {
  border: 1px solid var(--el-border-color);
  --header-background: var(--el-color-info-light-8);
}
</style>
