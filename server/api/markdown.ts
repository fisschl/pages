import Shiki from "@shikijs/markdown-it";
import { once } from "lodash-es";
import MarkdownIt from "markdown-it";
import { z } from "zod";

const request_schema = z.object({
  text: z.string(),
});

const markdown = MarkdownIt();

const load_plugins = once(async () => {
  const shiki = await Shiki({
    theme: "vitesse-dark",
  });
  return markdown.use(shiki);
});

const clean_markdown = MarkdownIt();

export const parseMarkdown = async (text: string) => {
  await load_plugins();
  try {
    return markdown.render(text);
  } catch (err) {
    console.log("渲染 Markdown 异常", err, text);
    return clean_markdown.render(text);
  }
};

export default defineEventHandler(async (event) => {
  const { text } = await readValidatedBody(event, request_schema.parse);
  const result = await parseMarkdown(text);
  return { html: result };
});
