import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

const cache = new Set<HTMLElement>();

export const openImageViewer = (target: Element) => {
  const image = target.closest("img");
  if (!image || cache.has(image)) return;
  Fancybox.fromNodes([image]);
};
