import { z } from "zod";

export const user_schema = z.object({
  id: z.string(),
  login: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable(),
  email: z.string().nullable(),
  role: z.string().nullable(),
});

export type User = z.infer<typeof user_schema>;

export const useUserStore = defineStore("pages-user", () => {
  const user = ref<User>();
  return { user };
});

export const useShouldLogin = async () => {
  const { user } = useUserStore();
  if (user) return user;
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
  // 请求用户信息
  const headers: Record<string, string> = useRequestHeaders(["cookie"]);
  if (query.token && typeof query.token === "string")
    headers.token = query.token;
  const { data } = await useFetch("/api/auth", { headers });
  const res = user_schema.safeParse(data.value);
  if (!res.success) return;
  const store = useUserStore();
  if (data.value) store.user = res.data;
};
