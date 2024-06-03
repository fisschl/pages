import { destr } from "destr";
import { isObject } from "lodash-es";
import type { MqttClient } from "mqtt";
import mqtt from "mqtt";
import { useUserStore } from "~/composables/user";

export const useSocket = () => {
  const socket = shallowRef<MqttClient>();
  const eventHook = createEventHook<object>();
  const token = useCookie("token");
  const user = useUserStore();

  onMounted(() => {
    if (!token.value || !user.user?.id) return;
    socket.value = mqtt.connect(`wss://emqx.bronya.world:443/mqtt`, {
      username: user.user.id,
      password: token.value,
    });
    socket.value.subscribe(user.user.id);
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
