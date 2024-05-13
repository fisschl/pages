import { destr } from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";

export type SocketHandler = (message: object) => unknown;

export const useSocket = (handler: SocketHandler) => {
  const socket = shallowRef<MqttClient>();
  const token = useCookie("token");

  onMounted(() => {
    if (!token.value) return;
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, {
      username: "public",
      password: "public",
    });
    socket.value.subscribe(`client/${token.value}`);
    socket.value.on("error", console.error);
    socket.value.on("message", (topic, payload) => {
      const message = destr(payload.toString());
      if (!isObject(message)) return;
      return handler(message);
    });
  });

  onBeforeUnmount(() => {
    socket.value?.removeAllListeners();
    socket.value?.end();
  });

  return { socket };
};
