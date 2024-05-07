import mqtt from "mqtt";
import { URL } from "node:url";

const uri = new URL(process.env.MQTT_URL!);

export const publisher = mqtt.connect(uri.toString(), {
  username: uri.username,
  password: uri.password,
});

publisher.on("error", console.error);
