import { getHighlighter } from "shiki";

const highlighter = await getHighlighter({});

export default defineEventHandler(async (event) => {
  const { text, lang } = await readBody(event);
  return {
    code: highlighter.codeToHtml(text, { lang }),
  };
});
