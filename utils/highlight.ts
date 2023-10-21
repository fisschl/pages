import { debounce } from "lodash-es";

export const parseHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const ele = doc.body.firstElementChild;
  if (!(ele instanceof HTMLElement)) return null;
  return ele;
};

export type ElementParam = MaybeRefOrGetter<HTMLElement | undefined | null>;

export const highlightAll = debounce((element: ElementParam) => {
  if (typeof window === "undefined") return;
  const ele = toValue(element) || document.body;
  ele.querySelectorAll("pre code").forEach(async (code) => {
    if (!code || code.classList.contains("shiki")) return;
    const text = code.textContent;
    const matches = code.className.match(/language-(\w+)/) || [];
    const lang = matches[1];
    if (!text || !lang) return;
    const html = await $fetch("/api/highlight", {
      method: "POST",
      body: JSON.stringify({ text, lang }),
    });
    const ele = parseHtml(html);
    if (!ele) return;
    ele.dataset.lang = lang;
    const pre = code.closest("pre") || code;
    if (!(pre instanceof HTMLElement)) return;
    ele.classList.add(...pre.classList);
    Object.assign(ele.style, pre.style);
    Object.assign(ele.dataset, pre.dataset);
    pre.replaceWith(ele);
  });
}, 200);
