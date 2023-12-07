import { getHighlighter } from "shiki";

const highlighter = getHighlighter({});

export default defineEventHandler(async (event) => {
  const { text, lang } = await readBody(event);
  const tool = await highlighter;
  return {
    code: tool.codeToHtml(text, { lang }),
  };
});
