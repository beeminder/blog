import { JSDOM } from "jsdom";

const EXCERPT_LENGTH = 300;

export default function getExcerpt(html: string): string {
  const dom = new JSDOM(html);

  const footnotes = Array.from(
    dom.window.document.querySelectorAll("a.footnote")
  );

  footnotes.forEach((footnote) => {
    footnote.remove();
  });

  const text = dom.window.document.body.textContent || "";
  const words = text.split(" ");
  const excerpt = words.reduce((acc, word) => {
    if (acc.length > EXCERPT_LENGTH) return acc;
    return acc ? `${acc} ${word}` : word;
  }, "");

  return `${excerpt}...`;
}
