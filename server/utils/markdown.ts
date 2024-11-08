import rehypeShiki from "@shikijs/rehype";
import { LRUCache } from "lru-cache";
import { hash } from "ohash";
import rehypeKatex from "rehype-katex";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const BracketsPattern =
  /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;

export const parseMarkdown = async (text: string) => {
  const input = text.replaceAll(
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
  const key = hash(text);
  const cache_result = markdown_cache.get(key);
  if (cache_result) return cache_result;
  const result = await parseMarkdown(text);
  console.info(result);
  markdown_cache.set(key, result);
  return result;
};

export const htmlToMarkdown = async (html?: string) => {
  if (!html?.trim()) return "";
  const result = await unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .process(html);
  return result.toString();
};
