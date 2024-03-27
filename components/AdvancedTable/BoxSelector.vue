<script setup lang="ts">
import { range } from "lodash-es";
import type { Table } from "./schema";
import type { Position } from "./utils";
import {
  elementFromEvent,
  elementPosition,
  indexFromCell,
  useAutoScroll,
} from "./utils";

const props = defineProps<{
  table: Table;
}>();

const container = toRef(props.table, "container");

// ****************************************************************************
// 选区
// ****************************************************************************

const selector = ref<HTMLElement>();

/**
 * 设置框选提示器的位置
 */
const setSelectorPosition = (selector: HTMLElement, ...rects: Position[]) => {
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.left + rect.width));
  const bottom = Math.max(...rects.map((rect) => rect.top + rect.height));
  selector.style.left = `${left}px`;
  selector.style.top = `${top}px`;
  selector.style.width = `${right - left}px`;
  selector.style.height = `${bottom - top}px`;
  selector.style.display = "block";
};

const selecting = ref(false);

const start: {
  position?: Position;
  index?: [number, number];
} = {};

useEventListener(container, "mousedown", (e) => {
  if (e.button !== 0) return;
  const cell = elementFromEvent(e);
  if (!cell) return;
  const index = indexFromCell(cell);
  if (!index) return;
  start.index = index;
  start.position = elementPosition(container.value!, cell);
  selecting.value = true;
  setSelectorPosition(selector.value!, start.position);
});

useEventListener("mousemove", (e) => {
  if (!selecting.value) return;
  const cell = elementFromEvent(e);
  if (!cell) return;
  const position = elementPosition(container.value!, cell);
  setSelectorPosition(selector.value!, start.position!, position);
  getSelection()?.removeAllRanges();
});

useEventListener("mouseup", (e) => {
  if (!selecting.value || !start.index) return;
  selecting.value = false;
  const cell = elementFromEvent(e);
  if (!cell) return;
  const index = indexFromCell(cell);
  if (!index) return;
  const { select_box } = props.table;
  select_box[0] = range(start.index[0], start.index[1] + 1);
  select_box[1] = range(index[0], index[1] + 1);
});

const selectBar = ref<HTMLElement>();

useAutoScroll(container, () => selecting.value);
</script>

<template>
  <div ref="selector" :class="$style.selector">
    <!-- 下拉填充手柄 -->
    <button ref="selectBar" :style="$style.bar"></button>
  </div>
</template>

<style module>
.selector {
  background-color: rgba(var(--el-color-info-rgb), 30%);
  display: none;
  border: 1px dashed var(--el-color-primary);
  position: absolute;
  pointer-events: none;
  transition-property: left, top, width, height;
  transition-duration: 50ms;
}

.selector .bar {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 5px;
  height: 5px;
  background-color: var(--el-border-color);
  pointer-events: all;
  cursor: crosshair;
}
</style>
