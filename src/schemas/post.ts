import { z } from "zod";
import { status } from "./status";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";
import getLegacyData from "../lib/getLegacyData";
import fetchPost from "../lib/fetchPost";
import matter from "gray-matter";
import { marked } from "marked";
import trimContent from "../lib/trimContent";
import { markedSmartypants } from "marked-smartypants";
import hooks from "../lib/markedHooks";
import addBlankLines from "../lib/addBlankLines";
import linkFootnotes from "../lib/linkFootnotes";
import expandRefs from "../lib/expandRefs";
import { Frontmatter, frontmatter } from "./frontmatter";
import { legacyPostOutput } from "./legacyPostOutput";

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
  data: Frontmatter;
} {
  const result = matter(markdown);

  return {
    ...result,
    data: frontmatter.parse(result.data),
  };
}

export const post = z
  .string()
  .transform(async (url) => {
    const wp = getLegacyData(url);
    const source = formatUrl(url);
    const md = await fetchPost(source);
    const { data, content: rawContent } = parseFrontmatter(md);
    const content = parseContent(rawContent);

    return {
      wp: legacyPostOutput.optional().parse(wp),
      source,
      md,
      content,
      fm: frontmatter.parse(data),
    };
  })
  .refine((p) => p.wp !== undefined || p.fm.excerpt !== undefined, {
    message: `Custom excerpts are required for new posts.`,
  })
  .transform(({ wp, fm, source, md, content }) => ({
    content,
    excerpt: fm.excerpt || getExcerpt(content),
    slug: z.string().parse(fm.slug || wp?.slug),
    image: image.optional().parse(fm.image || extractImage(content)),
    title: fm.title || wp?.title?.toString() || parseTitle(md),
    tags: [...(fm.tags || []), ...(wp?.tags || [])],
    date: z.date().parse(fm.date || wp?.date),
    url: source,
    author: z.string().parse(fm.author || wp?.author),
    status: status.default("draft").parse(fm.status || wp?.status),
    _wpId: wp?.id,
  }))
  .transform((post) => ({
    ...post,
    date_string: z.string().parse(post.date?.toISOString().split("T")[0]),
    disqus: {
      id: `${post._wpId} https://blog.beeminder.com/?p=${post._wpId}`,
      url: `https://blog.beeminder.com/${post.slug}/`,
    },
    _wpId: undefined,
  }));

export type Post = z.infer<typeof post>;
export type PostInput = z.input<typeof post>;
