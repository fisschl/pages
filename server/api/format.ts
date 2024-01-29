import { format } from "prettier";
import { z } from "zod";

const RequestBodySchema = z.object({
  text: z.string(),
  extension: z.string(),
});

export default defineEventHandler(async (event) => {
  const { text, extension } = await readValidatedBody(
    event,
    RequestBodySchema.parse,
  );
  const res = await format(text, {
    filepath: `file.${extension}`,
  });
  return { text: res };
});
