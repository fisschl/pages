import { z } from "zod";
import MarkdownIt from "markdown-it";
import Shiki from "@shikijs/markdown-it";

const RequestSchema = z.object({
  text: z.string(),
});

const markdown = MarkdownIt();

(async () => {
  const shiki = await Shiki({
    theme: "vitesse-dark",
  });
  markdown.use(shiki);
})();

export const parseMarkdown = (text: string) => {
  return markdown.render(text);
};

export default defineEventHandler(async (event) => {
  const { text } = await readValidatedBody(event, RequestSchema.parse);
  const result = parseMarkdown(text);
  return { text: result };
});
