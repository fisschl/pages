import type { UserResponse } from "~/server/api/auth";

export const useUserStore = defineStore("pages-user", () => {
  const info = ref<UserResponse>();
  const token = ref<string>();

  const shouldLogin = async () => {
    if (info.value) return;
    const url = useRequestURL();
    await navigateTo({
      path: "/login",
      query: { from: url.toString() },
    });
  };

  return { info, token, shouldLogin };
});

export const useShouldLogin = async () => {
  const { info } = useUserStore();
  if (info) return info;
  const url = useRequestURL();
  await navigateTo({
    path: "/login",
    query: { from: url.toString() },
  });
};

export const useAutoLogin = async () => {
  const { query } = useRoute();
  const router = useRouter();
  // 挂载时，清除掉 URL 里面的 token
  onMounted(async () => {
    if (!query.token) return;
    await router.replace({
      query: { ...query, token: undefined },
    });
  });
  const store = useUserStore();
  const { runWithContext } = useNuxtApp();
  await runWithContext(async () => {
    const headers = useRequestHeaders(["cookie"]);
    const { data } = await useFetch("/api/auth", { headers, query });
    if (!data.value) return;
    const { token, user } = data.value;
    store.token = token;
    store.info = user || undefined;
  });
  const theme = useCookie("theme");
  const colorMode = useColorMode();
  theme.value = colorMode.value;
};
