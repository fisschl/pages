import localforage from "localforage";
import { once } from "lodash-es";

export const IS_CLIENT = !!window;

export const local = once(() => {
  if (!window) return undefined;
  return localforage.createInstance({
    name: "pages",
  });
});
