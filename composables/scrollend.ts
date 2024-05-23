import { useEventListener, useResizeObserver } from "@vueuse/core";
import type { MaybeRefOrGetter } from "vue";

export const useScrollBottom = (
  container: MaybeRefOrGetter<HTMLElement | undefined | null>,
  list_element: MaybeRefOrGetter<HTMLElement | undefined | null>,
) => {
  const bottom = ref(0);

  const resetScroll = () => {
    const element = toValue(container);
    if (!element) return;
    const { scrollHeight, clientHeight } = element;
    element.scrollTop = scrollHeight - clientHeight - bottom.value;
  };

  useEventListener(container, "scrollend", () => {
    const element = toValue(container);
    if (!element) return;
    const { scrollTop, scrollHeight, clientHeight } = element;
    bottom.value = scrollHeight - scrollTop - clientHeight;
    console.log("scrollend", bottom.value);
  });

  useResizeObserver(list_element, resetScroll);
  onMounted(resetScroll);

  const scrollToBottom = () => {
    const element = toValue(container);
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  };

  return { scrollToBottom };
};
