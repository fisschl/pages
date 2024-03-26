<script setup lang="ts">
import type { Virtualizer } from "@tanstack/vue-virtual";
import { Table, type Column } from "./schema";
import table_style from "./table.module.css";

const { width_handler_button } = table_style;

const props = defineProps<{
  table: Table;
  virtualizer: Virtualizer<Element, Element>;
}>();

const widthIndicator = ref<HTMLElement>();
const dragging = ref(false);
const column = ref<Column>();

const start = reactive({
  index: 0,
  width: 0,
  left: 0,
});

/**
 * 当正在拖动列宽时，将鼠标样式设置为 cursor-col-resize
 */
watchEffect(() => {
  const { container } = props.table;
  if (!container) return;
  if (dragging.value) container.classList.add("cursor-col-resize");
  else container.classList.remove("cursor-col-resize");
});

const setIndicatorDisplay = (display: boolean) => {
  const indicator = widthIndicator.value;
  if (!indicator) return;
  indicator.style.display = display ? "block" : "none";
};

const setIndicatorLeft = (left: number) => {
  const indicator = widthIndicator.value;
  if (!indicator) return;
  const { container } = props.table;
  const rect = container?.getBoundingClientRect();
  if (!rect) return;
  indicator.style.left = `${left - rect.left}px`;
};

const handleMouseDown = (e: MouseEvent) => {
  if (!(e.target instanceof Element)) return;
  const button = e.target.closest(`.${width_handler_button}`);
  if (!button) return;
  const th = e.target?.closest(`[data-column]`);
  if (!(th instanceof HTMLElement)) return;
  const index = th.dataset.column;
  if (!index) return;
  start.index = +index;
  dragging.value = true;
  start.left = e.clientX;
  const { columns } = props.table;
  column.value = columns[+index];
  start.width = column.value.width;
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
  setIndicatorDisplay(true);
  setIndicatorLeft(e.clientX);
};
const handleMouseMove = (event: MouseEvent) => {
  if (!dragging.value) return;
  setIndicatorLeft(event.clientX);
};
const handleMouseUp = (e: MouseEvent) => {
  dragging.value = false;
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
  setIndicatorDisplay(false);
  if (!column.value) return;
  column.value.width = start.width + e.clientX - start.left;
  const item = props.virtualizer
    .getVirtualItems()
    .find((item) => item.index === start.index);
  if (!item) return;
  props.virtualizer.resizeItem(item, column.value.width);
};

useEventListener(toRef(props.table, "container"), "mousedown", handleMouseDown);
</script>

<template>
  <span
    ref="widthIndicator"
    class="absolute left-0 top-0 z-10 h-full"
    :class="$style.widthIndicator"
  ></span>
</template>

<style module>
.widthIndicator {
  width: 2px;
  pointer-events: none;
  background-color: var(--el-border-color);
  display: none;
}
</style>
