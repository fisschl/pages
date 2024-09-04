import mqtt from "mqtt";
import { URL } from "node:url";

const uri = new URL(process.env.MQTT_URL!);

const createClient = () => {
  const client = mqtt.connect(uri.toString(), {
    username: uri.username,
    password: uri.password,
  });
  client.on("error", (e) => {
    console.error(e);
  });
  return client;
};

export const publisher = createClient();

export const publish = (topic: string, message: object) => {
  const encoded = JSON.stringify(message);
  publisher.publish(topic, encoded);
};
