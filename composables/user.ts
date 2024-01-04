import type { user } from "@prisma/client";

export type User = Omit<user, "password" | "update_at">;

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
  const avatar = computed(() => {
    if (!user.value) return undefined;
    const { id, profile } = user.value;
    if (!profile) return undefined;
    return `https://cdn.fisschl.world/server/profile/${id}/${profile}`;
  });
  return { user, checkLogin, avatar };
});
