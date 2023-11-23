import { defineStore } from "pinia";

export const useNav = defineStore("nav", () => {
  const visible = ref(true);
  return { visible };
});
