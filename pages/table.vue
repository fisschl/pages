<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { throttle } from "lodash-es";

const columns = ["id", "name", "title", "email", "role"];

const rows: {
  [key: string]: string | number;
}[] = [
  ...Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "xxxxxxx.com",
    role: "Member",
  })),
];

const container = ref<HTMLElement>();
const start = ref<HTMLElement>();
const selector = ref<HTMLElement>();

onMounted(() => {
  const div = document.createElement("div");
  div.className = "selector";
  selector.value = div;
});

useEventListener(container, "mousedown", (e) => {
  if (!container.value) return;
  if (!selector.value) return;
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const td = target.closest("td");
  if (!td) return;
  start.value = td;
  if (container.value.contains(selector.value)) return;
  container.value.appendChild(selector.value);
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
  if (!container.value) return;
  if (!selector.value) return;
  const sRect = selector.value.getBoundingClientRect();
  return Array.from(container.value.querySelectorAll("td")).filter((cell) => {
    const rect = cell.getBoundingClientRect();
    return overlap(sRect, rect);
  });
};

const clearTextRange = throttle(() => {
  return getSelection()?.removeAllRanges();
}, 100);

useEventListener("mousemove", (e) => {
  if (!start.value) return;
  if (!container.value) return;
  if (!selector.value) return;
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  const td = target.closest("td");
  if (!td) return;
  setSelectorPosition(start.value, td);
  clearTextRange();
});

useEventListener("mouseup", () => {
  if (!start.value) return;
  start.value = undefined;
  const cells = findContainsCell();
  cells?.forEach((cell) => {
    cell.classList.add("selected");
  });
});
</script>

<template>
  <div
    ref="container"
    class="prose relative h-screen w-screen max-w-none overflow-auto px-10 py-6 dark:prose-invert"
  >
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
            :class="`cell-${column}-${row.id}`"
          >
            {{ row[column] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.prose .selector {
  border: 1px solid #46a53adc;
  background-color: #3fcb2d50;
  position: absolute;
  pointer-events: none;
}

.prose td.selected {
  background-color: #2d99cb7e;
}
</style>
