import { destr } from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";

export type Options = {
  topic: string | string[];
};

export const useSocket = (options: Options) => {
  const socket = shallowRef<MqttClient>();

  const eventHook = createEventHook<object>();

  onMounted(() => {
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, {
      username: "public",
      password: "public",
    });
    socket.value.subscribe(options.topic);
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
