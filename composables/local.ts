import localforage from "localforage";

export const IS_CLIENT = !!window;

export const local = IS_CLIENT
  ? localforage.createInstance({
      name: "pages",
    })
  : undefined;
