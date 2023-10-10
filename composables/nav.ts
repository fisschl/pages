import { defineStore } from "pinia";

export const useNav = defineStore("nav", () => {
  const lg = useMediaQuery(LG);
  const visible = ref(false);
  return { visible, lg };
});
