import type { UserResponse } from "~/server/api/auth";

export const useUserStore = defineStore("pages-user", () => {
  const info = ref<UserResponse>();

  const shouldLogin = async () => {
    if (info.value) return;
    const url = useRequestURL();
    await navigateTo(
      {
        path: "https://bronya.world/login",
        query: { from: url.toString() },
      },
      { external: true },
    );
  };

  return { info, shouldLogin };
});
