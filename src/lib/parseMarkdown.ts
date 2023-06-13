import { marked } from "marked";
import parseTitle from "./parseTitle";
import trimContent from "./trimContent";
import { markedSmartypants } from "marked-smartypants";
import hooks from "./markedHooks";
import addBlankLines from "./addBlankLines";
import linkFootnotes from "./linkFootnotes";
import expandRefs from "./expandRefs";
import getExcerpt from "./getExcerpt";
import getImage, { Image } from "./getImage";

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

export default function parseMarkdown(markdown: string): {
  title: string;
  content: string;
  excerpt: string;
  image: Image | undefined;
} {
  const blanked = addBlankLines(markdown);
  const trimmed = trimContent(blanked);
  const linked = linkFootnotes(trimmed);
  const expanded = expandRefs(linked);
  const content = marked.parse(expanded, MARKED_OPTIONS);

  return {
    title: parseTitle(markdown),
    content,
    excerpt: getExcerpt(content),
    image: getImage(content),
  };
}
