import Shiki from "@shikijs/markdown-it";
import { once } from "lodash-es";
import MarkdownIt from "markdown-it";
import { object, parse, string } from "valibot";

const RequestSchema = object({
  text: string(),
});

export const expert_markdown = once(async () => {
  const markdown = MarkdownIt();
  const shiki = await Shiki({
    theme: "vitesse-dark",
  });
  return markdown.use(shiki);
});

const markdown = MarkdownIt();

export const parseMarkdown = async (text: string) => {
  try {
    const markdown = await expert_markdown();
    return markdown.render(text);
  } catch (err) {
    console.log("渲染 Markdown 异常", err, text);
    return markdown.render(text);
  }
};

export default defineEventHandler(async (event) => {
  const { text } = await readValidatedBody(event, (value) =>
    parse(RequestSchema, value),
  );
  const result = await parseMarkdown(text);
  return { text: result };
});
