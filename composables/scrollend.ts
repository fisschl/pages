import { useEventListener, useResizeObserver } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";
import { debounce } from "lodash-es";

export const useScrollBottom = (
  container: MaybeRefOrGetter<HTMLElement | undefined | null>,
  list_element: MaybeRefOrGetter<HTMLElement | undefined | null>,
  disabled?: unknown,
) => {
  const bottom = ref(0);

  const resetScroll = () => {
    if (toValue(disabled)) return;
    const element = toValue(container);
    if (!element) return;
    const { scrollHeight, clientHeight } = element;
    element.scrollTop = scrollHeight - clientHeight - bottom.value;
  };

  const handleScrollEnd = debounce(() => {
    const element = toValue(container);
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    bottom.value = scrollHeight - scrollTop - clientHeight;
  }, 60);

  useEventListener(container, "scroll", handleScrollEnd);
  useResizeObserver(list_element, resetScroll);
  onMounted(resetScroll);

  const scrollToBottom = () => {
    const element = toValue(container);
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  };

  return { scrollToBottom };
};
