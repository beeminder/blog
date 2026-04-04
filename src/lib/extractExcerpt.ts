import striptags from "striptags";
import decodeHtmlEntities from "./decodeHtmlEntities";
import trimContent from "./trimContent";

const EXCERPT_LENGTH = 300;

export default function extractExcerpt(html: string): string {
  const trimmed = trimContent(html);
  // Remove footnote links before stripping tags
  const noFootnotes = trimmed.replace(
    /<a\s[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/a>/gi,
    "",
  );
  const text = decodeHtmlEntities(striptags(noFootnotes));
  const noNewlines = text.replace(/[\n\r]+/g, " ");
  const words = noNewlines.split(" ");
  const excerpt = words.reduce((acc, word) => {
    if (acc.length > EXCERPT_LENGTH) return acc;
    return acc ? `${acc} ${word}` : word;
  }, "");

  return `${excerpt.trim()}...`;
}
