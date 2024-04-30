import amqp from "amqplib";

export const rabbit = amqp.connect(process.env.RABBITMQ_URL!);

export const useChannel = async () => {
  return (await rabbit).createChannel();
};
