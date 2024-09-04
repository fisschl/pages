import { xxhash3 } from "hash-wasm";
import { LRUCache } from "lru-cache";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import rehypeShiki from "@shikijs/rehype";

const BracketsPattern =
  /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\]|\\\((.*?)\\\)/g;

export const parseMarkdown = async (text: string) => {
  const input = text.replace(
    BracketsPattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      // 匹配代码块是为了避免其内部的代码被替换
      if (codeBlock) return codeBlock;
      // 将 \[ \] 替换成 $$ $$
      if (squareBracket) return `$$${squareBracket}$$`;
      // 将 \( \) 替换成 $ $
      if (roundBracket) return `$${roundBracket}$`;
      return match;
    },
  );
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeShiki, {
      theme: "catppuccin-mocha",
    })
    .use(rehypeStringify)
    .process(input);
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
  console.info(result);
  markdown_cache.set(hash, result);
  return result;
};
