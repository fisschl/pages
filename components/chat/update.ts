import type { Message } from "./type";
import { renderMermaid } from "~/components/chat/mermaid";
import { update } from "~/utils/snabbdom";

export const updateMessage = async (item: Message, article: HTMLElement) => {
  await update(article, item.content);
  if (item.status === "stable") await renderMermaid(article);
};
