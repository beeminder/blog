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

export const post = z
  .object({
    url: z.string(),
    md: z.string(),
  })
  .transform(({ url, md }) => {
    const { data, content } = matter(md);
    const meta = {
      ...legacyPost.parse(url),
      ...frontmatter.parse(data),
    };

    return {
      ...meta,
      excerpt: meta.excerpt || getExcerpt(content),
      image: extractImage(content),
      title: meta.title || parseTitle(md),
      date_string: dateString.parse(meta.date),
      content,
    };
  })
  .pipe(
    z.object({
      content: body,
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
