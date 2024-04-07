import { format } from "prettier";
import { z } from "zod";
import { parseMarkdown } from "./markdown";

const RequestSchema = z.object({
  text: z.string(),
  extension: z.string(),
});

export default defineEventHandler(async (event) => {
  const { text, extension } = await readValidatedBody(
    event,
    RequestSchema.parse,
  );
  const result = await format(text, {
    filepath: `file.${extension}`,
  });
  const markdown = "```" + extension + "\n" + result + "\n " + "```";
  const html = await parseMarkdown(markdown);
  return { text: result, html };
});
