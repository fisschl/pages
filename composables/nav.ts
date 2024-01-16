import { defineStore } from "pinia";

export const useNavStore = defineStore("nav", () => {
  const cookie = useCookie("pages-nav-visible");

  const visible = computed(() => {
    return cookie.value?.toString() === "true";
  });

  return { cookie, visible };
});
