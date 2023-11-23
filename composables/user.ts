import type { user } from "@prisma/client";

export const useUserStore = defineStore("user", () => {
  const u = ref<user>();
  return { u };
});
