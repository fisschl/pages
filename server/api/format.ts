import { format } from "prettier";
import { parseMarkdown } from "./markdown";
import { z } from "zod";

const request_schema = z.object({
  text: z.string(),
  extension: z.string(),
});

export default defineEventHandler(async (event) => {
  const { text, extension } = await readValidatedBody(
    event,
    request_schema.parse,
  );
  const result = await format(text, {
    filepath: `file.${extension}`,
  });
  const markdown = "```" + extension + "\n" + result + "\n " + "```";
  const html = await parseMarkdown(markdown);
  return { text: result, html };
});
