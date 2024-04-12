import { z } from "zod";

export const file_schema = z.object({
  key: z.string(),
});

export const message_schema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  create_at: z.string().optional(),
  chat_file: z.array(file_schema).optional(),
});

export type Message = z.output<typeof message_schema>;
