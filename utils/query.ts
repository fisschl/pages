/**
 * 将对象转换为 URL 查询参数
 */
export const toSearchParams = (param: object, sp = new URLSearchParams()) => {
  const append = (key: string, value: unknown) => {
    if (typeof value === "string") return sp.append(key, value);
    if (typeof value === "number" || typeof value === "boolean")
      return sp.append(key, value.toString());
  };
  Object.entries(param).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((value) => append(key, value));
    else append(key, value);
  });
  return sp;
};
