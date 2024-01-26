import { isString } from "lodash-es";
import { z } from "zod";

export const OptionsQuerySchema = z
  .union([z.string(), z.array(z.string())])
  .optional();

export const parseOptionsQuery = (value: Record<string, any>, key: string) => {
  const item = value[key];
  const res = OptionsQuerySchema.safeParse(item);
  if (!res.success || !res.data) return [];
  if (isString(res.data)) return [res.data];
  return res.data;
};

export type Nullable<T> = T | null | undefined;

export const useOptionsQuery = (key: string) => {
  const route = useRoute();
  const router = useRouter();
  return computed({
    get: () => {
      return parseOptionsQuery(route.query, key);
    },
    set: async (value) => {
      const query = { ...route.query, [key]: value };
      await router.replace({ query });
    },
  });
};
