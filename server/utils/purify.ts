import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

const { window } = new JSDOM();

const purify = DOMPurify(window);
export const sanitize = (html: string) => {
  return purify.sanitize(html);
};
