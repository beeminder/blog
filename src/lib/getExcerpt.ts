import { JSDOM } from "jsdom";

const EXCERPT_LENGTH = 300;

export default function getExcerpt(html: string): string {
  const dom = new JSDOM(html);

  const footnotes = Array.from(
    dom.window.document.querySelectorAll("a.footnote")
  );

  footnotes.forEach((el) => el.remove());

  const text = dom.window.document.body.textContent || "";
  const noNewlines = text.replace(/[\n\r]+/g, " ");
  const words = noNewlines.split(" ");
  const excerpt = words.reduce((acc, word) => {
    if (acc.length > EXCERPT_LENGTH) return acc;
    return acc ? `${acc} ${word}` : word;
  }, "");

  return `${excerpt}...`;
}
