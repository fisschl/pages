export interface User {
  id: string;
  name: string;
  password: string;
  avatar: string | null;
  role: string | null;
}

export const useUserStore = defineStore("pages-user", () => {
  const user = ref<User>();
  const route = useRoute();
  const router = useRouter();

  const tokenAccept = async () => {
    if (!route.query.token) return;
    const query = {
      ...route.query,
      token: undefined,
    };
    await router.replace({ query });
  };
  const token = useCookie("token");

  return { user, tokenAccept, token };
});

export const useShouldLogin = () => {
  const user = useUserStore();

  onMounted(async () => {
    if (user.user) return;
    await navigateTo({
      path: "/login",
      query: { from: location.href },
    });
  });

  return user.user!;
};

export const useTokenAccept = () => {
  const route = useRoute();
  const router = useRouter();
  onMounted(async () => {
    if (!route.query.token) return;
    const query = {
      ...route.query,
      token: undefined,
    };
    await router.replace({ query });
  });
};
