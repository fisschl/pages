import { defineStore } from "pinia";

export const useNavStore = defineStore("nav", () => {
  const visible = ref(true);

  return { visible };
});
