import { encode } from "@msgpack/msgpack";
import consola from "consola";
import mqtt from "mqtt";
import { URL } from "node:url";
import { arrayToBuffer } from "./redis";

const uri = new URL(process.env.MQTT_URL!);

const createClient = () => {
  const client = mqtt.connect(uri.toString(), {
    username: uri.username,
    password: uri.password,
  });
  client.on("error", consola.error);
  return client;
};

export const publisher = createClient();

export const publish = (topic: string, message: object) => {
  const encoded = encode(message);
  const buffer = arrayToBuffer(encoded);
  publisher.publish(topic, buffer);
};
