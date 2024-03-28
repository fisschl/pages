import { useUserStore } from "~/composables/user";

export const useWindowStore = defineStore("pages-window", () => {
  const user = useUserStore();
  const client = computed(() => {
    return user.token;
  });
  const server = ref("");
  const sse = ref<EventSource>();

  const connect = async () => {
    disconnect();
    await $fetch("/api/window/push", {
      method: "POST",
      body: {
        key: server,
        value: {
          method: "握手",
          client: client.value,
        },
      },
    });
    sse.value = new EventSource(`/api/sse?key=${client.value}`);
  };

  const disconnect = () => {
    sse.value?.close();
    sse.value = undefined;
  };

  const listen = (handler: (data: any) => void) => {
    useEventListener(sse, "message", (ev) => {
      if (!(ev instanceof MessageEvent)) return;
      handler(JSON.parse(ev.data));
    });
  };

  return { server, connect, disconnect, sse, listen };
});
