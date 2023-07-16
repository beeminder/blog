import { marked } from "marked";
import trimContent from "./trimContent";
import { markedSmartypants } from "marked-smartypants";
import hooks from "./markedHooks";
import addBlankLines from "./addBlankLines";
import linkFootnotes from "./linkFootnotes";
import expandRefs from "./expandRefs";
import matter from "gray-matter";
import type { z } from "zod";
import { frontmatter } from "../schemas/frontmatter";
import { parsedMarkdown, type ParsedMarkdown } from "../schemas/parsedMarkdown";

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

function parseFrontmatter(markdown: string): matter.GrayMatterFile<string> & {
  data: z.infer<typeof frontmatter>;
} {
  const result = matter(markdown);

  return {
    ...result,
    data: frontmatter.parse(result.data),
  };
}

function parseContent(markdown: string): string {
  const blanked = addBlankLines(markdown);
  const trimmed = trimContent(blanked);
  const linked = linkFootnotes(trimmed);
  const expanded = expandRefs(linked);

  return marked.parse(expanded, MARKED_OPTIONS);
}

export default function parseMarkdown(markdown: string): ParsedMarkdown {
  const { data: fm, content: rawContent } = parseFrontmatter(markdown);
  const content = parseContent(rawContent);

  return parsedMarkdown.parse({ fm, md: markdown, content });
}
