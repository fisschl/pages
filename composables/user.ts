import type { User } from "~/server/database/schema";

export const useUserStore = defineStore("user", () => {
  const user = ref<User>();
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
