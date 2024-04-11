import type { ZodType, z } from "zod";

type QueryValue = string | number | boolean | undefined;

export const useQuery = <T extends ZodType>(schema: T) => {
  const route = useRoute();
  const router = useRouter();
  const query = computed<z.output<T>>(() => {
    return schema.parse(schema, route.query);
  });
  const setQuery = async (
    param: Partial<Record<keyof z.output<T>, QueryValue>>,
  ) => {
    await router.replace({ query: { ...query.value, ...param } });
    await nextTick();
  };
  return { query, setQuery, route, router };
};
