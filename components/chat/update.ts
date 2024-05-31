import type { VNode } from "snabbdom";
import {
  attributesModule,
  classModule,
  datasetModule,
  fragment,
  init,
  propsModule,
  styleModule,
  toVNode,
} from "snabbdom";
import type { Message } from "./type";
import { renderMermaid } from "~/components/chat/mermaid";

const patch = init(
  [classModule, propsModule, attributesModule, datasetModule, styleModule],
  undefined,
  { experimental: { fragments: true } },
);

const parser = new DOMParser();

const parse = async (html: string) => {
  const { body } = parser.parseFromString(html, "text/html");
  const nodes = Array.from(body.children).map((node) => toVNode(node));
  return fragment(nodes);
};

const vNodeCache = new WeakMap<HTMLElement, VNode>();

const createInnerElement = (article: HTMLElement) => {
  const element = document.createElement("p");
  article.replaceChildren(element);
  return element;
};

export const updateMessage = async (item: Message, article: HTMLElement) => {
  const node = await parse(item.content);
  const vNode = patch(
    vNodeCache.get(article) || createInnerElement(article),
    node,
  );
  vNodeCache.set(article, vNode);
  if (item.status === "stable") await renderMermaid(article);
};
