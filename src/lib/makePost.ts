import fetchPost from "./fetchPost";
import getLegacyData from "./getLegacyData";
import type { PostInput } from "../schemas/post";
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

marked.use(markedSmartypants());
marked.use({ hooks });

const MARKED_OPTIONS = {
  mangle: false,
  headerIds: false,
} as const;

function formatUrl(url: string) {
  const hasSchema = url.startsWith("http");
  const isDtherpad = url.includes("dtherpad.com");

  if (isDtherpad) {
    url = url.replace("dtherpad.com", "padm.us");
  }

  return hasSchema ? url : `https://${url}`;
}

function parseContent(markdown: string): string {
  const blanked = addBlankLines(markdown);
  const trimmed = trimContent(blanked);
  const linked = linkFootnotes(trimmed);
  const expanded = expandRefs(linked);

  return marked.parse(expanded, MARKED_OPTIONS);
}

function parseFrontmatter(markdown: string): matter.GrayMatterFile<string> & {
  data: z.infer<typeof frontmatter>;
} {
  const result = matter(markdown);

  return {
    ...result,
    data: frontmatter.parse(result.data),
  };
}

export default async function makePostInput(url: string): Promise<PostInput> {
  const wp = getLegacyData(url);
  const markdownUrl = formatUrl(url);
  const markdown = await fetchPost(markdownUrl);
  const { data: fm, content: rawContent } = parseFrontmatter(markdown);
  const content = parseContent(rawContent);
  const parsed = { fm, md: markdown, content };

  return {
    wp,
    markdownUrl,
    markdown,
    parsed,
  };
}
