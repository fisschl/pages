import mermaid from "mermaid";
import { uniqueId } from "lodash-es";

export const renderMermaid = async (container: HTMLElement) => {
  const list = container.querySelectorAll(".language-mermaid");
  for (const item of list) {
    if (!(item instanceof HTMLElement)) return;
    const box = document.createElement("section");
    container.appendChild(box);
    const { svg } = await mermaid.render(
      uniqueId("mermaid_"),
      item.innerText,
      box,
    );
    const pre = item.parentElement;
    if (!pre) return;
    box.innerHTML = svg;
    if (pre.nextElementSibling)
      pre.parentElement?.insertBefore(box, pre.nextElementSibling);
    else pre.parentElement?.appendChild(box);
    box.classList.add("bg-stone-300", "rounded", "px-2", "py-3");
  }
};
