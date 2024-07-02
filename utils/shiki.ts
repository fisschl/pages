import { codeToHtml } from "shiki";

const findLanguage = (code: HTMLElement) => {
  const prefix = "language-";
  for (const className of code.classList) {
    if (!className.startsWith(prefix)) continue;
    return className.replace(prefix, "");
  }
};

const parser = new DOMParser();

export const renderCode = async (container: HTMLElement) => {
  const elements = container.getElementsByTagName("pre");
  for (const pre of elements) {
    const codes = pre.getElementsByTagName("code");
    if (!codes.length) continue;
    for (const code of codes) {
      const language = findLanguage(code);
      if (!language) continue;
      const html = await codeToHtml(code.innerText, {
        lang: language,
        themes: {
          light: "catppuccin-latte",
          dark: "catppuccin-mocha",
        },
      });
      const { body } = parser.parseFromString(html, "text/html");
      pre.replaceWith(...body.children);
    }
  }
};
