import destr from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";

export interface SocketOptions {
  topic: string;
  username: string;
  clientId: string;
}

export const useSocket = () => {
  const socket = shallowRef<MqttClient>();
  const hook = createEventHook<object>();
  const user = useUserStore();

  const destroyClient = () => {
    const client = socket.value;
    if (!client) return;
    socket.value = undefined;
    client.removeAllListeners();
    client.end();
  };

  const connect = async (options: SocketOptions) => {
    if (socket.value) destroyClient();
    const client = mqtt.connect(`wss://mqtt.bronya.world:443/mqtt`, {
      username: options.username,
      password: options.username,
      clientId: options.clientId,
    });
    client.subscribe(options.topic);
    client.on("error", (error) => {
      console.error(error);
    });
    client.on("message", async (_topic, payload) => {
      const text = payload.toString();
      const value = destr(text);
      if (!isObject(value)) return;
      await hook.trigger(value);
    });
    socket.value = client;
  };

  onBeforeUnmount(destroyClient);

  return reactive({ ...hook, connect, socket });
};
