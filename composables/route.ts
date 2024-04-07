import type { ZodType, output } from "zod";

type QueryValue = string | number | boolean | undefined;

export const useQuery = <T extends ZodType>(schema: T) => {
  const route = useRoute();
  const router = useRouter();
  const query = computed<output<T>>(() => {
    return schema.parse(route.query);
  });
  const setQuery = async (
    param: Partial<Record<keyof output<T>, QueryValue>>,
  ) => {
    await router.replace({ query: { ...route.query, ...param } });
    await nextTick();
  };
  return { query, setQuery, route, router };
};
