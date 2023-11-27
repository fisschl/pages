import { z } from "zod";

export const Item = z.object({
  id: z.string(),
});
