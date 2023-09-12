<script setup lang="ts">
import { useEventListener } from "@vueuse/core";

const columns = ["id", "name", "title", "level", "role"];

const rows: {
  [key: string]: string;
}[] = [
  ...Array.from({ length: 1000 }, (_, i) => ({
    id: String(i),
    name: "Lindsay Walton " + i,
    title: "Front-end Developer " + i,
    level: "1.1.1.1",
    role: "Member " + i,
  })),
];

const container = ref<HTMLElement>();
const start = ref<HTMLElement>();
const selector = ref<HTMLElement>();
const selectBar = ref<HTMLElement>();

const cells = ref<HTMLElement[]>([]);

useEventListener(container, "mousedown", (e) => {
  if (!container.value) return;
  if (!selector.value) return;
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const td = target.closest("td");
  if (!td) return;
  start.value = td;
  if (!container.value.contains(selector.value))
    container.value.appendChild(selector.value);
  setSelectorPosition(td);
  cells.value = [td];
});

const setSelectorPosition = (...elements: HTMLElement[]) => {
  if (!container.value) return;
  if (!selector.value) return;
  const rects = elements.map((ele) => ele.getBoundingClientRect());
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  const { scrollTop, scrollLeft } = container.value;
  const { clientLeft, clientTop } = container.value;
  selector.value.style.left = `${left + scrollLeft - clientLeft}px`;
  selector.value.style.top = `${top + scrollTop - clientTop}px`;
  selector.value.style.width = `${right - left}px`;
  selector.value.style.height = `${bottom - top}px`;
};

const lessThan = (left: number, right: number) => {
  return left - right < 3;
};

/**
 * 判断两个矩形是否重叠
 */
const overlap = (a: DOMRect, b: DOMRect) => {
  return !(
    lessThan(a.right, b.left) ||
    lessThan(b.right, a.left) ||
    lessThan(a.bottom, b.top) ||
    lessThan(b.bottom, a.top)
  );
};

const findContainsCell = () => {
  if (!container.value) return [];
  if (!selector.value) return [];
  const sRect = selector.value.getBoundingClientRect();
  return Array.from(container.value.querySelectorAll("td")).filter((cell) => {
    const rect = cell.getBoundingClientRect();
    return overlap(sRect, rect);
  });
};

useEventListener("mousemove", (e) => {
  if (!start.value) return;
  if (!selector.value) return;
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const td = target.closest("td");
  if (!td) return;
  setSelectorPosition(start.value, td);
  getSelection()?.removeAllRanges();
});

useEventListener("mouseup", () => {
  if (!start.value) return;
  start.value = undefined;
  cells.value = findContainsCell();
});

const selectRect = ref<DOMRect>();

useEventListener(selectBar, "mousedown", () => {
  selectRect.value = selector.value?.getBoundingClientRect();
  container.value?.classList.add("cursor-crosshair");
});

useEventListener("mousemove", (e) => {
  if (!selector.value) return;
  if (!selectRect.value) return;
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const rect = target.closest("td")?.getBoundingClientRect();
  if (!rect) return;
  const bottom = Math.max(selectRect.value.bottom, rect.bottom);
  selector.value.style.height = `${bottom - selectRect.value.top}px`;
  getSelection()?.removeAllRanges();
});

const autoFill = (...list: HTMLElement[]) => {};

useEventListener("mouseup", () => {
  if (!selectRect.value) return;
  selectRect.value = undefined;
  container.value?.classList.remove("cursor-crosshair");
  const list = findContainsCell();
  autoFill(...list);
  cells.value = list;
});
</script>

<template>
  <div
    ref="container"
    class="prose relative h-screen w-screen max-w-none overflow-auto px-10 py-6 dark:prose-invert"
  >
    <p>选中项： {{ cells?.length }}</p>
    <table ref="container" class="table-ele">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column">
            {{ column.toUpperCase() }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td
            v-for="column in columns"
            :key="column"
            :class="[`column-${column}`, `row-${row.id}`]"
          >
            {{ row[column] }}
          </td>
        </tr>
      </tbody>
    </table>
    <div ref="selector" class="selector">
      <button ref="selectBar" class="bar"></button>
    </div>
  </div>
</template>

<style scoped>
.prose .selector {
  border: 1px solid #46a53adc;
  background-color: #3fcb2d50;
  position: absolute;
  pointer-events: none;
  transition-property: left, top, width, height;
  transition-duration: 50ms;
}

.prose .selector .bar {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 5px;
  height: 5px;
  background-color: #054126f3;
  pointer-events: all;
  cursor: crosshair;
}
</style>
