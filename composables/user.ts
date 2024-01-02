import type { user } from "@prisma/client";

export const useUserStore = defineStore("user", () => {
  const user = ref<user>();
  const route = useRoute();
  const checkLogin = async () => {
    if (user.value) return user.value;
    await navigateTo({
      path: "/login",
      query: { from: route.fullPath },
    });
  };
  return { user, checkLogin };
});
