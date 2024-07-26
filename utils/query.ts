export const parseRecord = (params: object) => {
  const record: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value && typeof value === "string") record[key] = value;
  });
  return record;
};

export const appendParams = (baseURL: string, obj: Record<string, any>) => {
  if (!obj) return baseURL;
  const index = baseURL.indexOf("?");
  const instance = new URLSearchParams(
    index === -1 ? undefined : baseURL.slice(index + 1),
  );
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === "string") return instance.set(key, value);
    if (typeof value === "number" || typeof value === "boolean")
      return instance.set(key, value.toString());
  });
  if (index === -1) return `${baseURL}?${instance}`;
  return `${baseURL.slice(0, index)}?${instance}`;
};
