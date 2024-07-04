import destr from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import type { MaybeRefOrGetter } from "vue";

export const useSocket = (topic?: MaybeRefOrGetter<string | undefined>) => {
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

  const createClient = async () => {
    if (socket.value) destroyClient();
    const key = toValue(topic);
    if (!key) return;
    const isPublic = key.startsWith("public/");
    const client = mqtt.connect(`wss://mqtt.bronya.world:443/mqtt`, {
      username: isPublic ? "public" : user.info?.id,
      password: isPublic ? "public" : user.token,
      clientId: user.token,
    });
    client.subscribe(key);
    client.on("error", console.error);
    client.on("message", async (_topic, payload) => {
      const text = payload.toString();
      const value = destr(text);
      if (!isObject(value)) return;
      await hook.trigger(value);
    });
    socket.value = client;
  };

  onMounted(createClient);
  watch(() => toValue(topic), createClient);
  onBeforeUnmount(destroyClient);

  return { socket, hook };
};
