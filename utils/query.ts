const append = (sp: URLSearchParams, key: string, value: unknown) => {
  if (typeof value === "string") {
    sp.append(key, value);
    return;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    sp.append(key, value.toString());
    return;
  }
};

/**
 * 将对象转换为 URL 查询参数
 */
export const toSearchParams = (param: object, sp = new URLSearchParams()) => {
  Object.entries(param).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((value) => append(sp, key, value));
    else append(sp, key, value);
  });
  return sp;
};
