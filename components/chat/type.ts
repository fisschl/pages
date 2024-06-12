import { z } from "zod";

export const image_schema = z.object({
  image_id: z.string(),
  image: z.string(),
});

export const message_schema = z.object({
  message_id: z.string(),
  time: z.string().optional(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  images: z.array(image_schema).optional(),
  status: z.enum(["stable", "loading"]).optional(),
});

export type Message = z.output<typeof message_schema>;
