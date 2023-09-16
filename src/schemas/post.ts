import { z } from "zod";
import { status } from "./status";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";
import matter from "gray-matter";

import { frontmatter } from "./frontmatter";
import { legacyPost } from "./legacyPost";
import { body } from "./body";
import { dateString } from "./dateString";
import striptags from "striptags";

export const post = z
  .object({
    source: z.string(),
    id: z.string().optional(),
    title: z.string().optional(),
    slug: z.string().optional(),
    date: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    disqus_id: z.string().optional(),
    excerpt: z.string().optional(),
    md: z.string(),
  })
  .transform(({ source: url, md, ...rest }) => {
    const { data, content } = matter(md);
    const meta = {
      ...rest,
      ...legacyPost.parse(url),
      ...frontmatter.parse(data),
    };
    const c = body.safeParse(content);

    if (!c.success) {
      throw new Error(
        `Failed to parse post ${url}: ${c.error.message}`,
        c.error,
      );
    }

    const date = meta.date && new Date(meta.date);

    return {
      ...meta,
      tags: meta.tags?.filter(Boolean) || [],
      excerpt: meta.excerpt ? striptags(meta.excerpt) : getExcerpt(c.data),
      image: extractImage(c.data),
      title: meta.title || parseTitle(md),
      date,
      date_string: dateString.parse(date),
      content: c.data,
    };
  })
  .pipe(
    z.object({
      content: z.string(),
      excerpt: z.string(),
      slug: z.string(),
      image: image.optional(),
      title: z.string(),
      tags: z.array(z.string()).default([]),
      date: z.date(),
      date_string: z.string(),
      author: z.string(),
      status: status.default("draft"),
      disqus_id: z.string(),
    }),
  );

export type Post = z.infer<typeof post>;
export type PostInput = z.input<typeof post>;
