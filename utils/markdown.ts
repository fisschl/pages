import { renderMermaid } from "~/utils/mermaid";
import { renderCode } from "~/utils/shiki";

export const mountContent = async (article: HTMLElement) => {
  await renderCode(article);
  await renderMermaid(article);
};
