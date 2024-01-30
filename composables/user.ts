import type { User } from "~/server/utils/schema";
import { picture_cdn } from "~/utils/image";

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
    const id = user.value?.avatar_id;
    if (!id) return undefined;
    return picture_cdn(id);
  });
  return { user, checkLogin, avatar };
});
