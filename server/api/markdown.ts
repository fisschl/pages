import Shiki from "@shikijs/markdown-it";
import { once } from "lodash-es";
import MarkdownIt from "markdown-it";
import { z } from "zod";

const request_schema = z.object({
  text: z.string(),
});

const load_markdown = once(async () => {
  const markdown = MarkdownIt();
  const shiki = await Shiki({
    theme: "vitesse-dark",
  });
  return markdown.use(shiki);
});

const clean_markdown = MarkdownIt();

export const parseMarkdown = async (text: string) => {
  const markdown = await load_markdown();
  try {
    return markdown.render(text);
  } catch (err) {
    return clean_markdown.render(text);
  }
};

export default defineEventHandler(async (event) => {
  const { text } = await readValidatedBody(event, request_schema.parse);
  const result = await parseMarkdown(text);
  return { html: result };
});
