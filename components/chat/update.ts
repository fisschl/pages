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

const patch = init(
  [classModule, propsModule, attributesModule, datasetModule, styleModule],
  undefined,
  { experimental: { fragments: true } },
);

const parser = new DOMParser();

const parse = (html: string | Element[]) => {
  if (typeof html === "string") {
    const { body } = parser.parseFromString(html, "text/html");
    html = Array.from(body.children);
  }
  const nodes = html.map((node) => toVNode(node));
  return fragment(nodes);
};

const vNodeCache = new WeakMap<HTMLElement, VNode>();

const createInnerElement = (article: HTMLElement) => {
  const element = document.createElement("p");
  article.replaceChildren(element);
  return element;
};

export const updateMessage = async (item: Message) => {
  const itemElement = document.getElementById(item.id);
  if (!itemElement) return;
  const article = itemElement.querySelector("article.prose");
  if (!(article instanceof HTMLElement)) return;
  const node = parse(item.content);
  const vNode = patch(
    vNodeCache.get(article) || createInnerElement(article),
    node,
  );
  vNodeCache.set(article, vNode);
};
