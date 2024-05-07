import { destr } from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";

export type SocketHandler = (message: object) => unknown;

export const useSocket = (key: string, handler: SocketHandler) => {
  const socket = shallowRef<MqttClient>();

  onMounted(() => {
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, {
      username: "public",
      password: "public",
    });
    socket.value.subscribe(key);
    socket.value.on("error", console.error);
    socket.value.on("message", (topic, payload) => {
      const message = destr(payload.toString());
      if (!isObject(message)) return;
      handler(message);
    });
  });

  onBeforeUnmount(() => {
    socket.value?.removeAllListeners();
    socket.value?.end();
  });

  return { socket };
};
