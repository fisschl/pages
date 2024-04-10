import { parse, type BaseSchema, type Output } from "valibot";

type QueryValue = string | number | boolean | undefined;

export const useQuery = <T extends BaseSchema>(schema: T) => {
  const route = useRoute();
  const router = useRouter();
  const query = computed<Output<T>>(() => {
    return parse(schema, route.query);
  });
  const setQuery = async (
    param: Partial<Record<keyof Output<T>, QueryValue>>,
  ) => {
    await router.replace({ query: { ...route.query, ...param } });
    await nextTick();
  };
  return { query, setQuery, route, router };
};
