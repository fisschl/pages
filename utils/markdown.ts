import { renderMermaid } from "~/utils/mermaid";

export const mountContent = async (article: HTMLElement) => {
  await renderMermaid(article);
};
