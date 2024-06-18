import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export const useImageViewer = (
  element: MaybeRefOrGetter<HTMLElement | null | undefined>,
) => {
  const cache = new Set<HTMLElement>();
  useEventListener(element, "click", (e) => {
    const { target } = e;
    if (!(target instanceof Element)) return;
    const image = target.closest("img");
    if (!image || cache.has(image)) return;
    Fancybox.fromNodes([image]);
  });
};
