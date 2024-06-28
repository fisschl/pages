import Shiki from "@shikijs/markdown-it";
import { once } from "lodash-es";
import MarkdownIt from "markdown-it";
import { LRUCache } from "lru-cache";
import { xxhash3 } from "hash-wasm";

const load_markdown = once(async () => {
  const markdown = MarkdownIt();
  const shiki = await Shiki({
    theme: "vitesse-dark",
    fallbackLanguage: "bash",
  });
  return markdown.use(shiki);
});

export const markdown_cache = new LRUCache<string, string>({
  max: 1024,
});

export const parseMarkdown = async (text: string) => {
  const markdown = await load_markdown();
  return markdown.render(text);
};

export const parseMarkdownCache = async (text: string) => {
  const hash = await xxhash3(text);
  const cache_result = markdown_cache.get(hash);
  if (cache_result) return cache_result;
  const markdown = await load_markdown();
  const result = markdown.render(text);
  markdown_cache.set(hash, result);
  return result;
};
