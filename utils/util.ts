/**
 * 查找对象中与目标对象不相等的键值对
 */
export const changed = <T extends object>(state: T, origin: any) => {
  if (!origin) return state;
  const result: Partial<T> = {};
  for (const key in state) {
    const value = state[key];
    if (origin[key] !== value) result[key] = value;
  }
  return result;
};
