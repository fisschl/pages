export const useFormState = <T extends object>(object?: T) => {
  const state = reactive<Record<string, string | number>>({});
  const setState = (object?: T) => {
    Object.keys(state).forEach((key) => delete state[key]);
    if (!object) return;
    for (const [key, value] of Object.entries(object)) {
      if (typeof value === "string" || typeof value === "number") {
        state[key] = value;
      }
    }
  };
  setState(object);
  return { state, setState };
};
