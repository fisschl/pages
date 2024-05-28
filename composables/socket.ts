import { destr } from "destr";
import { isObject } from "lodash-es";
import type { IClientOptions, MqttClient } from "mqtt";
import mqtt from "mqtt";

export type SocketHandler = (message: object) => unknown;

export type Options = IClientOptions & {
  topic: string | string[];
};

export const useSocket = (options: Options) => {
  const socket = shallowRef<MqttClient>();

  const handler: SocketHandler[] = [];

  onMounted(() => {
    console.log(options);
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, options);
    socket.value.subscribe(options.topic);
    socket.value.on("error", console.error);
    socket.value.on("message", (topic, payload) => {
      const message = destr(payload.toString());
      if (!isObject(message)) return;
      handler.forEach((fn) => fn(message));
    });
  });

  onBeforeUnmount(() => {
    socket.value?.removeAllListeners();
    socket.value?.end();
  });

  const onMessage = (fn: SocketHandler) => {
    handler.push(fn);
  };

  return { socket, onMessage };
};
