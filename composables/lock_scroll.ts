import {
  refThrottled,
  useResizeObserver,
  useScroll,
  whenever,
} from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";
import { reactive, toValue } from "vue";

export interface LockOption {
  scrollTarget: MaybeRefOrGetter<HTMLElement | undefined | null>;
  direction: MaybeRefOrGetter<"top" | "bottom">;
  resizeTarget: MaybeRefOrGetter<HTMLElement | undefined | null>;
  disabled?: unknown;
}

export const useLockScroll = (option: LockOption) => {
  const { disabled, scrollTarget, direction } = option;

  const store = reactive({
    top: 0,
    bottom: 0,
  });

  const resetScroll = () => {
    if (toValue(disabled)) return;
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    switch (toValue(direction)) {
      case "top": {
        scroller.scrollTop = store.top;
        break;
      }
      case "bottom": {
        const { scrollHeight, clientHeight } = scroller;
        scroller.scrollTop = scrollHeight - clientHeight - store.bottom;
        break;
      }
    }
  };

  const { resizeTarget } = option;
  useResizeObserver(resizeTarget, resetScroll);

  const saveScrollState = () => {
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    store.top = scroller.scrollTop;
    const { scrollHeight, clientHeight } = scroller;
    store.bottom = scrollHeight - clientHeight - scroller.scrollTop;
  };

  const { isScrolling, directions, y, arrivedState } = useScroll(scrollTarget, {
    offset: { top: 10, bottom: 10 },
  });

  whenever(() => !isScrolling.value, saveScrollState);

  const scrollToBottom = () => {
    const scroller = toValue(scrollTarget);
    if (!scroller) return;
    y.value = scroller.scrollHeight;
  };

  const scrollToTop = () => {
    y.value = 0;
  };

  return {
    scrollToTop,
    scrollToBottom,
    directions,
    arrivedState,
    scrollTop: y,
    throttledScrollTop: refThrottled(y, 200),
  };
};
