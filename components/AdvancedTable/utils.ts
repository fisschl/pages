import type { MaybeRefOrGetter } from "vue";

export type UnRef<T> = T extends MaybeRefOrGetter<infer U> ? U : never;

/**
 * 获取此次事件的单元格元素
 */
export const elementFromEvent = (e: Event) => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  return target.closest("td");
};

export const indexFromCell = (
  cell: HTMLElement,
): [number, number] | undefined => {
  const { row, column } = cell.dataset;
  if (!row || !column) return;
  return [+row, +column];
};

/**
 * 获取索引对应的单元格（单元格必须已经渲染出来）
 */
export const elementFromIndex = (
  container: HTMLElement,
  x: number,
  y: number,
) => {
  const element = container.querySelector(
    `[data-row="${x}"][data-column="${y}"]`,
  );
  if (!(element instanceof HTMLElement)) return;
  return element;
};

/**
 * 单元格位置及尺寸
 */
export interface Position {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * 获取子元素相对于父元素的位置
 */
export const elementPosition = (parent: HTMLElement, target: HTMLElement) => {
  const cellRect = target.getBoundingClientRect();
  const containerRect = parent.getBoundingClientRect();
  const { scrollLeft, scrollTop } = parent;
  const position: Position = {
    width: cellRect.width,
    height: cellRect.height,
    left: cellRect.left + scrollLeft - containerRect.left - 1,
    top: cellRect.top + scrollTop - containerRect.top - 1,
  };
  return position;
};

const SCROLL_SPEED = 1 / 20;

/**
 * 当鼠标超出表格范围的时候，根据鼠标超出的距离，对表格进行滚动。
 * 使用 requestAnimationFrame 进行帧控制。
 */
export const useAutoScroll = (
  container: MaybeRefOrGetter<HTMLElement | undefined | null>,
  enable: MaybeRefOrGetter<boolean>,
) => {
  const moving = ref(false);
  const lastTick = ref(0);
  const startScroll = () => {
    const parent = toValue(container);
    if (!toValue(enable) || !parent) return (moving.value = false);
    const dis = overDistance();
    if (!dis) return (moving.value = false);
    const now = Date.now();
    const delta = (now - lastTick.value) * SCROLL_SPEED;
    lastTick.value = now;
    if (dis.left) parent.scrollLeft -= dis.left * delta;
    if (dis.top) parent.scrollTop -= dis.top * delta;
    if (dis.right) parent.scrollLeft += dis.right * delta;
    if (dis.bottom) parent.scrollTop += dis.bottom * delta;
    requestAnimationFrame(startScroll);
  };

  const mouse = ref<MouseEvent>();

  const overDistance = () => {
    const parent = toValue(container);
    if (!mouse.value || !toValue(enable) || !parent) return;
    const { clientX, clientY } = mouse.value;
    const rect = parent.getBoundingClientRect();
    const dis = { left: 0, top: 0, right: 0, bottom: 0 };
    if (clientX < rect.left) dis.left = rect.left - clientX;
    if (clientX > rect.right) dis.right = clientX - rect.right;
    if (clientY < rect.top) dis.top = rect.top - clientY;
    if (clientY > rect.bottom) dis.bottom = clientY - rect.bottom;
    if (!dis.left && !dis.top && !dis.right && !dis.bottom) return;
    return dis;
  };

  useEventListener("mousemove", (e) => {
    if (!toValue(enable) || !toValue(container)) return;
    mouse.value = e;
    if (moving.value) return;
    moving.value = true;
    lastTick.value = Date.now();
    return startScroll();
  });
};
