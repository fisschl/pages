export const scrollTarget = () => {
  if (typeof window === "undefined") return null;
  return document.getElementById("__nuxt");
};

export const scrollToBottom = () => {
  const element = scrollTarget();
  if (!element) return;
  element.scrollTo({ top: element.scrollHeight });
};

export const useScrollTarget = () => {
  const isMounted = useMounted();
  return computed(() => {
    if (!isMounted.value) return null;
    return scrollTarget();
  });
};
