import { cloneDeep, get, set } from "lodash-es";
import { diff } from "ohash";

export const useForm = <T extends object>(
  state: T,
  handleSubmit: (params: Partial<T>) => void | Promise<void>,
) => {
  const lastState = ref<object>(cloneDeep(state));
  const changedList = computed(() => {
    return diff(lastState.value, state);
  });
  const submitChanges = async () => {
    const params: Partial<T> = {};
    for (const { key, type } of changedList.value) {
      if (type === "removed") continue;
      set(params, key, get(state, key));
    }
    await handleSubmit(params);
    lastState.value = cloneDeep(state);
  };
  return { changedList, submitChanges };
};
