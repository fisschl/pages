import Shiki from "@shikijs/markdown-it";
import { once } from "lodash-es";
import MarkdownIt from "markdown-it";
import { xxhash3 } from "hash-wasm";
import { DAY, redis } from "../database/redis";

const load_markdown = once(async () => {
  const markdown = MarkdownIt();
  const shiki = await Shiki({
    themes: {
      light: "catppuccin-latte",
      dark: "catppuccin-mocha",
    },
    fallbackLanguage: "bash",
  });
  return markdown.use(shiki);
});

export const parseMarkdown = async (text: string) => {
  const markdown = await load_markdown();
  return markdown.render(text);
};

export const parseMarkdownCache = async (text: string) => {
  const hash = await xxhash3(text);
  const cache_result = await redis.get(hash);
  if (cache_result) return cache_result;
  const markdown = await load_markdown();
  const result = markdown.render(text);
  await redis.setex(hash, 30 * DAY, result);
  return result;
};
