import { tryOnMounted, tryOnBeforeUnmount } from "@vueuse/core";
import { isFunction } from "lodash-es";

export const useLifeCycle = (callback: () => unknown) => {
  let cleanup: unknown = undefined;
  tryOnMounted(async () => (cleanup = await callback()));
  tryOnBeforeUnmount(() => isFunction(cleanup) && cleanup());
};
