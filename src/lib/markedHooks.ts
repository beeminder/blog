import { JSDOM } from "jsdom";

function applyIdsToElements(html: string): string {
  const dom = new JSDOM(html);

  const elements = Array.from(
    dom.window.document.querySelectorAll(
      "*:not(script):not(noscript):not(style)"
    )
  ).filter((e) => {
    return (
      e.textContent?.length &&
      e.children.length === 0 &&
      /\{.*?\}/.test(e.textContent)
    );
  });

  elements.forEach((el) => {
    if (!el.textContent) return;

    const idText = el.textContent.match(/\{#(.*)\}/)?.[1];
    const newTextContent = el.textContent.replace(/\{#([^}]*?)\}/g, "").trim();

    if (idText) {
      el.setAttribute("id", idText);
    }

    el.textContent = newTextContent;
  });

  return dom.window.document.body.innerHTML;
}

export default {
  postprocess(html: string): string {
    return applyIdsToElements(html);
  },
};
