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
import matter from "gray-matter";

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

export type ParsedMarkdown = {
  title: string;
  content: string;
  excerpt: string;
  image: Image | undefined;
  frontmatter: Record<string, unknown>;
};

export default function parseMarkdown(markdown: string): ParsedMarkdown {
  const blanked = addBlankLines(markdown);
  const trimmed = trimContent(blanked);
  const linked = linkFootnotes(trimmed);
  const expanded = expandRefs(linked);
  const content = marked.parse(expanded, MARKED_OPTIONS);
  const { data } = matter(markdown);
  const title =
    typeof data.title === "string" ? data.title : parseTitle(markdown);
  const excerpt =
    typeof data.excerpt === "string" ? data.excerpt : getExcerpt(content);
  const image =
    typeof data.image?.src === "string" ? data.image : getImage(content);

  return {
    title,
    content,
    excerpt,
    image,
    frontmatter: data,
  };
}
