import { useResizeObserver, useScroll, whenever } from "@vueuse/core";
import { debounce } from "lodash-es";
import type { MaybeRefOrGetter } from "vue";
import { useTemplateRef } from "vue";

export interface ScrollState {
  scrollTop: number;
  scrollBottom: number;
}

export interface LockOption {
  disabled?: MaybeRefOrGetter<unknown>;
  onArrivedTop?: () => unknown;
  onScrollEnd?: (state: ScrollState) => unknown;
}

export const useLockScroll = (option: LockOption = {}) => {
  const { disabled } = option;

  const scrollTarget = useTemplateRef<HTMLElement>("scroller");

  const state = reactive<ScrollState>({
    scrollTop: 0,
    scrollBottom: 0,
  });

  const resetScroll = () => {
    if (toValue(disabled)) return;
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    const { scrollHeight, clientHeight } = scroller;
    scroller.scrollTop = scrollHeight - clientHeight - state.scrollBottom;
  };

  const resizeTarget = useTemplateRef<HTMLElement>("resizer");
  useResizeObserver(resizeTarget, resetScroll);

  const { onScrollEnd } = option;

  const saveScrollState = debounce(() => {
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    const { scrollHeight, clientHeight } = scroller;
    state.scrollBottom = scrollHeight - clientHeight - scroller.scrollTop;
    state.scrollTop = scroller.scrollTop;
    if (onScrollEnd) onScrollEnd(state);
  }, 10);

  const { arrivedState, directions } = useScroll(scrollTarget, {
    offset: { top: 10, bottom: 10 },
    onScroll: () => saveScrollState(),
  });

  const scrollToBottom = () => {
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    state.scrollBottom = 0;
    scroller.scrollTop = scroller.scrollHeight;
  };

  const scrollToTop = () => {
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    scroller.scrollTop = 0;
  };

  whenever(
    () => arrivedState.top,
    () => {
      const { onArrivedTop } = option;
      if (onArrivedTop) onArrivedTop();
    },
  );

  return {
    arrivedState,
    directions,
    scrollTarget,
    resizeTarget,
    scrollToTop,
    scrollToBottom,
  };
};
