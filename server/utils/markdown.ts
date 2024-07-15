import { xxhash3 } from "hash-wasm";
import { LRUCache } from "lru-cache";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const parseMarkdown = async (text: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(text);
  return file.toString();
};

export const markdown_cache = new LRUCache<string, string>({
  max: 64 * 1024,
});

export const parseMarkdownCache = async (text: string) => {
  const hash = await xxhash3(text);
  const cache_result = markdown_cache.get(hash);
  if (cache_result) return cache_result;
  const result = await parseMarkdown(text);
  markdown_cache.set(hash, result);
  return result;
};
