import striptags from "striptags";
import decodeHtmlEntities from "./decodeHtmlEntities";
import trimContent from "./trimContent";

const EXCERPT_LENGTH = 300;
const MAGIC_AUTO_EXTRACT = "MAGIC_AUTO_EXTRACT";

function cleanText(input: string): string {
  return decodeHtmlEntities(striptags(input));
}

function autoExtract(html: string): string {
  const trimmed = trimContent(html);
  // Remove footnote links before stripping tags
  const noFootnotes = trimmed.replace(
    /<a\s[^>]*class="[^"]*footnote[^"]*"[^>]*>.*?<\/a>/gi,
    "",
  );
  const text = cleanText(noFootnotes);
  const noNewlines = text.replace(/[\n\r]+/g, " ");
  const words = noNewlines.split(" ");
  const excerpt = words.reduce((acc, word) => {
    if (acc.length > EXCERPT_LENGTH) return acc;
    return acc ? `${acc} ${word}` : word;
  }, "");

  return `${excerpt.trim()}...`;
}

export default function resolveExcerpt(
  rawExcerpt: string | undefined,
  htmlContent: string,
): string | undefined {
  switch (rawExcerpt) {
    case MAGIC_AUTO_EXTRACT:
      return autoExtract(htmlContent);
    case undefined:
      return undefined;
    default:
      return cleanText(rawExcerpt);
  }
}
