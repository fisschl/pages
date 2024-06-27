import destr from "destr";
import { isObject } from "lodash-es";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";
import type { MaybeRefOrGetter } from "vue";

export interface SocketOption extends IClientOptions {
  topic: string;
}

export const useSocket = (option: MaybeRefOrGetter<SocketOption>) => {
  const socket = shallowRef<MqttClient>();
  const hook = createEventHook<object>();

  onMounted(() => {
    const opt = toValue(option);
    const client = mqtt.connect(`wss://mqtt.bronya.world:443/mqtt`, opt);
    client.subscribe(opt.topic);
    client.on("error", console.error);
    client.on("message", async (topic, payload) => {
      const text = payload.toString();
      const value = destr(text);
      if (!isObject(value)) return;
      await hook.trigger(value);
    });
    socket.value = client;
  });

  onBeforeUnmount(() => {
    const client = socket.value;
    if (!client) return;
    socket.value = undefined;
    client.removeAllListeners();
    client.end();
  });

  return { socket, hook };
};
