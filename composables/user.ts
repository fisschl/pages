import type { User } from "@prisma/client";

export const useUserStore = defineStore("user", () => {
  const u = ref<User>();

  return { u };
});

export const useMustLogin = async () => {
  const user = useUserStore();
  const route = useRoute();

  if (!user.u) {
    await navigateTo({
      path: "/login",
      query: { from: route.fullPath },
    });
  }

  return user;
};
