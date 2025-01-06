import { io, type Socket } from "socket.io-client";

export const useSocketStore = defineStore("socket.io-client", {
  state: (): {
    socket: Socket | null;
  } => ({
    socket: null,
  }),
  actions: {
    setSocket() {
      if (this.socket) return;
      const instance = io("https://bronya.world");
      this.socket = markRaw(instance);
    },
  },
});

export const useSocket = () => {
  const store = useSocketStore();
  onMounted(() => {
    store.setSocket();
  });
  return toRef(store, "socket");
};
