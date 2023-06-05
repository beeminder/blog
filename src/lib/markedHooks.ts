import { JSDOM } from "jsdom";

export default {
  postprocess(html: string): string {
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
      const newTextContent = el.textContent
        .replace(/\{#([^}]*?)\}/g, "")
        .trim();

      if (idText) {
        el.setAttribute("id", idText);
      }

      el.textContent = newTextContent;
    });

    const htmlString = dom.window.document.body.innerHTML;

    return htmlString;
  },
};
