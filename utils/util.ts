import { toValue, type MaybeRefOrGetter } from "vue";

export type Value<T> = T extends MaybeRefOrGetter<infer U> ? U : T;

/**
 * 将对象的首层从 Ref 转换为值
 */
export const objectUnRef = <T extends object>(
  param: T,
): { [P in keyof T]: Value<T[P]> } => {
  const result: any = {};
  for (const key in param) {
    const value = toValue(param[key]);
    result[key] = value;
  }
  return result;
};

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
