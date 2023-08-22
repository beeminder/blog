import getDom from "./getDom";
import trimContent from "./trimContent";

const EXCERPT_LENGTH = 300;

export default function getExcerpt(html: string): string {
  const trimmed = trimContent(html);
  const { document } = getDom(trimmed);
  const footnotes = Array.from(document.querySelectorAll("a.footnote"));

  footnotes.forEach((el) => el.remove());

  const text = document.body.textContent || "";
  const noNewlines = text.replace(/[\n\r]+/g, " ");
  const words = noNewlines.split(" ");
  const excerpt = words.reduce((acc, word) => {
    if (acc.length > EXCERPT_LENGTH) return acc;
    return acc ? `${acc} ${word}` : word;
  }, "");

  return `${excerpt}...`;
}
