import { isString } from "lodash-es";
import type { ComputedRef } from "vue";
import { z } from "zod";

export const OptionsQuerySchema = z
  .union([z.string(), z.array(z.string())])
  .optional();

export type UseOptionsQueryReturn = [
  ComputedRef<string[]>,
  (value: Iterable<string>) => void,
];

export const useOptionsQuery = (key: string): UseOptionsQueryReturn => {
  const route = useRoute();
  const options = computed(() => {
    const item = route.query[key];
    const res = OptionsQuerySchema.safeParse(item);
    if (!res.success) return [];
    const { data } = res;
    if (!data) return [];
    if (isString(data)) return [data];
    return data;
  });
  const router = useRouter();
  const setOptions: UseOptionsQueryReturn[1] = (options) => {
    return router.replace({
      query: { ...route.query, [key]: Array.from(options) },
    });
  };
  return [options, setOptions];
};

export type Nullable<T> = T | null | undefined;
