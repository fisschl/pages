import { getHighlighter, setCDN } from "shiki";
import { debounce } from "lodash-es";

const asyncHighlighter = (() => {
  setCDN("https://cdn.jsdelivr.net/npm/shiki/");
  return getHighlighter({});
})();

export const parseHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const ele = doc.body.firstElementChild;
  if (!(ele instanceof HTMLElement)) return null;
  return ele;
};

export const highlight = debounce(
  async (element: HTMLElement | undefined | null) => {
    if (typeof window === "undefined") return;
    const highlighter = await asyncHighlighter;
    element?.querySelectorAll("pre code").forEach((block) => {
      const pre = block.closest("pre");
      if (!pre || pre.classList.contains("shiki")) return;
      const lang = block.className.match(/language-(\S+)/)?.[1];
      if (!lang) return;
      const code = block.textContent;
      if (!code) return;
      const html = highlighter.codeToHtml(code, { lang });
      const newPre = parseHtml(html);
      if (!newPre) return;
      newPre.dataset.lang = lang;
      pre.replaceWith(newPre);
    });
  },
  200,
);