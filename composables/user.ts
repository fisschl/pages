import type { User } from "~/server/database/schema";

export const useUserStore = defineStore("pages-user", () => {
  const user = ref<User>();
  const route = useRoute();
  const checkLogin = async () => {
    if (user.value) return user.value;
    await navigateTo({
      path: "/login",
      query: { from: route.fullPath },
    });
  };
  const token = useCookie("token");
  return { user, checkLogin, token };
});
