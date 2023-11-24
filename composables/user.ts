import type { User } from "@prisma/client";

export const useUserStore = defineStore("user", () => {
  const u = ref<User>();
  const router = useRouter();
  const route = useRoute();

  const tryLogin = () => {
    if (u.value) return;
    router.replace({
      path: "/login",
      query: { from: route.fullPath },
    });
  };

  return { u, tryLogin };
});
