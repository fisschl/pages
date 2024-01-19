import { once, pull } from "lodash-es";

export const useSseStore = defineStore("sse", () => {
  const sse = ref<EventSource>();

  const listenerMap = new Map<string, Function[]>();

  const create = once(() => {
    sse.value = new EventSource("/api/sse");
    sse.value.onmessage = ({ data }) => {
      const res = JSON.parse(data);
      const listeners = listenerMap.get(res.type);
      if (!listeners?.length) return;
      listeners.forEach((cb) => cb(res.data));
    };
  });

  const listen = (type: string, cb: Function) => {
    const listeners = listenerMap.get(type);
    if (listeners) {
      listeners.push(cb);
    } else {
      listenerMap.set(type, [cb]);
    }
    tryOnUnmounted(() => {
      const listeners = listenerMap.get(type);
      if (!listeners?.length) return;
      pull(listeners, cb);
    });
  };

  return { sse, create, listen };
});
