import { z, type TypeOf } from "zod";
import { isArray, isString } from "lodash-es";
import type { ComputedRef } from "vue";

export const OptionsQuerySchema = z
  .union([z.string(), z.array(z.string())])
  .optional();

export type GetSetTuple<T> = [ComputedRef<T>, (value: T) => void];

export const useOptionsQuery = (key: string): GetSetTuple<string[]> => {
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
  const setOptions = (options: string[]) => {
    return router.replace({
      query: { ...route.query, [key]: options },
    });
  };
  return [options, setOptions];
};

export const getOptionsQueryFilter = (
  key: string,
  item: TypeOf<typeof OptionsQuerySchema>,
) => {
  if (!item || !item.length) return undefined;
  if (isString(item)) return `${key} = ${item}`;
  if (isArray(item)) return `${key} IN [${item.join()}]`;
  return undefined;
};
