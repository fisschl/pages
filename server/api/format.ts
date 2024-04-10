import { format } from "prettier";
import { parseMarkdown } from "./markdown";
import { object, parse, string } from "valibot";

const RequestSchema = object({
  text: string(),
  extension: string(),
});

export default defineEventHandler(async (event) => {
  const { text, extension } = await readValidatedBody(event, (value) =>
    parse(RequestSchema, value),
  );
  const result = await format(text, {
    filepath: `file.${extension}`,
  });
  const markdown = "```" + extension + "\n" + result + "\n " + "```";
  const html = await parseMarkdown(markdown);
  return { text: result, html };
});
