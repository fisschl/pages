import { destr } from "destr";
import { isObject } from "lodash-es";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";
import type { MaybeRefOrGetter } from "vue";

export interface SocketOption extends IClientOptions {
  topic: string;
}

export const useSocket = (option: MaybeRefOrGetter<SocketOption>) => {
  const socket = shallowRef<MqttClient>();
  const eventHook = createEventHook<object>();
  onMounted(() => {
    const opt = toValue(option);
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, opt);
    socket.value.subscribe(opt.topic);
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
