import { z } from "zod";
import { status } from "./status";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";
import { dateString } from "./dateString";
import { cachedParseMarkdown } from "../lib/cachedParseMarkdown";

// RawPost: validates the metadata shape of an input post.
// Intentionally does NOT do any markdown parsing or content processing —
// that work belongs to processPost(). Keeping this schema pure makes
// validation tests trivial and lets callers obtain validated metadata
// without paying for the full content pipeline.
export const rawPost = z.object({
  source: z.string().min(1),
  title: z.string().optional(),
  slug: z.string().min(1),
  date: z.string().min(1),
  author: z.string().min(1),
  tags: z.array(z.string()),
  status: status,
  disqus_id: z.string().min(1),
  excerpt: z.string(),
  redirects: z.array(z.string()),
  md: z.string(),
});

export type RawPost = z.infer<typeof rawPost>;

// Output shape of a fully processed post — same as the previous schema
// output. Kept as a Zod schema so consumers can still validate processed
// posts (e.g. when reading from cache) and so the inferred Post type
// stays in sync.
const post = z.object({
  content: z.string(),
  excerpt: z.string(),
  slug: z.string().min(1),
  image: image.or(z.undefined()),
  title: z.string(),
  tags: z.array(z.string()),
  redirects: z.array(z.string()),
  date: z.date(),
  date_string: z.string(),
  author: z.string().min(1),
  status: status,
  disqus_id: z.string().min(1),
  md: z.string(),
});

export type Post = z.infer<typeof post>;

// processPost: turns a validated RawPost into a fully processed Post.
// Owns the content pipeline (markdown parse, title extraction, excerpt
// computation, first-image extraction, date conversion). This is the
// single place where content-processing concerns live.
export function processPost(raw: RawPost): Post {
  const { source: url, md, title: rawTitle, ...rest } = raw;

  if (rawTitle) {
    throw new Error(
      `(${url}) : Title is not allowed in posts.json. Specify in markdown only. "BEGIN_MAGIC[The-Post-Name-Here]"`,
    );
  }

  let content: string;
  try {
    content = cachedParseMarkdown(md);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to parse post ${url}: ${message}`, {
      cause: error,
    });
  }

  const date = new Date(rest.date);

  const processed = {
    ...rest,
    tags: rest.tags?.filter(Boolean),
    excerpt: getExcerpt(rest.excerpt, content),
    image: extractImage(content),
    title: parseTitle(md),
    date,
    date_string: dateString.parse(date),
    content,
    md,
  };

  // Run the processed object through `post` so the output shape and
  // invariants (e.g. title required, image schema, status enum) are
  // enforced at exactly one seam, just like before.
  return post.parse(processed);
}
