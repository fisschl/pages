import {
  init,
  classModule,
  propsModule,
  styleModule,
  toVNode,
  fragment,
  type VNode,
} from "snabbdom";

export type { VNode };

export const patch = init([classModule, propsModule, styleModule], undefined, {
  experimental: { fragments: true },
});

export const parser = new DOMParser();

export const parse = (html: string | Element[]) => {
  if (typeof html === "string") {
    const { body } = parser.parseFromString(html, "text/html");
    html = Array.from(body.children);
  }
  const nodes = html.map((node) => toVNode(node));
  return fragment(nodes);
};
