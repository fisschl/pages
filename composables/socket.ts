import { io, type Socket } from "socket.io-client";

export const useSocket = () => {
  const socket = useState("socket.io-client", () => shallowRef<Socket>());
  onMounted(() => {
    if (socket.value) return;
    socket.value = io("https://bronya.world");
  });
  return socket;
};
