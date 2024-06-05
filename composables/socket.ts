import { destr } from "destr";
import { isObject } from "lodash-es";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";

export interface SocketOption extends IClientOptions {
  topic: string;
}

export const useSocket = (option: SocketOption) => {
  const socket = shallowRef<MqttClient>();
  const eventHook = createEventHook<object>();
  onMounted(() => {
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, option);
    socket.value.subscribe(option.topic);
    socket.value.on("error", console.error);
    socket.value.on("message", async (topic, payload) => {
      const message = destr(payload.toString());
      if (!isObject(message)) return;
      await eventHook.trigger(message);
    });
  });
  onBeforeUnmount(() => {
    socket.value?.removeAllListeners();
    socket.value?.end();
  });
  return { socket, eventHook };
};
