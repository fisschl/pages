import type { User } from "~/app.vue";

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

  const avatar = computed(() => {
    if (!user.value?.avatar) return;
    return `https://cdn.fisschl.world/${user.value.avatar}`;
  });
  return { user, checkLogin, token, avatar };
});
