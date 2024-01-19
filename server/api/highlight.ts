import { getHighlighter } from "shiki";

const highlighter = getHighlighter({});

export default defineEventHandler(async (event) => {
  const { text, lang } = await readBody(event);
  const { codeToHtml } = await highlighter;
  const code = codeToHtml(text, { lang });
  return { code };
});
