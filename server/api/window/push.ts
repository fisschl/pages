import { z } from "zod";
import { publisher } from "~/server/database/redis";

const BodySchema = z.object({
  key: z.string(),
  value: z.any(),
});

export default defineEventHandler(async (event) => {
  const { key, value } = await readValidatedBody(event, BodySchema.parse);
  await publisher.publish(key, JSON.stringify(value));
  return { message: "成功" };
});
