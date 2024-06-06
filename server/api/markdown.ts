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

// 正则表达式，用于匹配中文字符和英文字符交界的位置
const chineseAndEnglishRegex =
  /([\u4e00-\u9fa5])([0-9a-zA-Z])|([0-9a-zA-Z])([\u4e00-\u9fa5])/g;

export const parseMarkdown = async (text: string) => {
  const markdown = await load_markdown();
  // 将中文字符和英文字符之间插入空格
  text = text.replace(chineseAndEnglishRegex, "$1$3 $2$4");
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
