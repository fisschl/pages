import amqp from "amqplib";

export const rabbit = amqp.connect(process.env.RABBITMQ_URL!);

const publisher = (async () => {
  return (await rabbit).createChannel();
})();

export const publish = async (key: string, message: string) => {
  (await publisher).publish(key, "", Buffer.from(message));
};
