import {
  attributesModule,
  classModule,
  datasetModule,
  fragment,
  init,
  propsModule,
  styleModule,
  toVNode,
  type VNode,
} from "snabbdom";

const patch = init(
  [classModule, propsModule, attributesModule, datasetModule, styleModule],
  undefined,
  { experimental: { fragments: true } },
);

const parser = new DOMParser();

const parse = (html: string) => {
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

export const update = (article: HTMLElement, html: string) => {
  const vNode = patch(
    vNodeCache.get(article) || createInnerElement(article),
    parse(html),
  );
  vNodeCache.set(article, vNode);
};
