import mermaid from "mermaid";
import { uniqueId } from "lodash-es";

export const renderMermaid = async (container: HTMLElement) => {
  const list = container.querySelectorAll(".language-mermaid");
  for (const item of list) {
    if (!(item instanceof HTMLElement)) return;
    const { svg } = await mermaid.render(uniqueId("mermaid_"), item.innerText);
    const pre = item.parentElement;
    if (!pre) return;
    const box = document.createElement("section");
    box.innerHTML = svg;
    if (pre.nextElementSibling)
      pre.parentElement?.insertBefore(box, pre.nextElementSibling);
    else pre.parentElement?.appendChild(box);
    box.classList.add("bg-stone-200", "rounded", "px-2", "py-3");
  }
};
