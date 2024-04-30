import { destr } from "destr";
import { isObject } from "lodash-es";

export type SocketHandler = (message: object) => unknown;

export const useSocket = (key: string) => {
  const socket = ref<WebSocket>();
  const timer = ref<ReturnType<typeof setInterval>>();

  onMounted(() => {
    socket.value = new WebSocket(`/api/socket?key=${key}`);
    timer.value = setInterval(() => {
      socket.value?.send("ping");
    }, 5000);
  });

  onBeforeUnmount(() => {
    socket.value?.close();
    clearInterval(timer.value);
  });

  const subscribe = (handler: SocketHandler) => {
    useEventListener(socket, "message", (e) => {
      if (!(e instanceof MessageEvent)) return;
      const message = destr(e.data);
      if (!isObject(message)) return;
      return handler(message);
    });
  };

  const publish = async (items: Record<string, object>) => {
    socket.value?.send(JSON.stringify(items));
  };

  return { socket, subscribe, publish };
};
