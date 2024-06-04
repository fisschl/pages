import { z } from "zod";

export const image_schema = z.object({
  image_id: z.string(),
  image: z.string(),
});

export const message_schema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  create_at: z.string().optional(),
  images: z.array(image_schema).optional(),
  status: z.enum(["stable", "loading"]).optional(),
});

export type Message = z.output<typeof message_schema>;
