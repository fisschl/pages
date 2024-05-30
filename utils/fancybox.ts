import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

export const bind = (element: HTMLElement) => {
  Fancybox.bind(element, "[data-fancybox]");
};

export const unbind = (element: HTMLElement) => {
  Fancybox.unbind(element);
};
