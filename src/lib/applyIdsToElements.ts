import getDom from "./getDom";

function apply(html: string) {
  const { document } = getDom(html);

  const matches = document.querySelectorAll(
    "*:not(script):not(noscript):not(style):not(:empty)",
  );

  matches.forEach((el) => {
    if (el.children.length) return;
    if (!el.textContent?.length) return;

    const idText = el.textContent.match(/\{#(.*)\}/)?.[1];

    if (!idText) return;

    const newTextContent = el.textContent.replace(/\{#([^}]*?)\}/g, "").trim();

    el.setAttribute("id", idText);
    el.textContent = newTextContent;
  });

  return document.body.innerHTML;
}

export default function applyIdsToElements(html: string): string {
  return /\{#.*?\}/.test(html) ? apply(html) : html;
}
