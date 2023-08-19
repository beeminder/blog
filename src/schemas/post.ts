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

    return {
      url,
      wp: legacyPost.parse(url),
      md,
      content: body.parse(content),
      fm: frontmatter.parse(data),
    };
  })
  .refine(
    (p) => p.wp !== undefined || p.fm.excerpt !== undefined,
    (p) => ({
      message: `Custom excerpts are required for new posts. URL: ${p.url}`,
    }),
  )
  .refine(
    (p) => p.wp !== undefined || p.fm.disqusID !== undefined,
    (p) => ({
      message: `Custom disqus ids are required for new posts. URL: ${p.url}`,
    }),
  )
  .transform(({ wp, fm, md, content }) => ({
    content,
    excerpt: fm.excerpt || wp?.excerpt || getExcerpt(content),
    slug: z
      .string({
        required_error: "`slug` is required",
      })
      .parse(fm.slug || wp?.slug),
    image: image.optional().parse(extractImage(content)),
    title: fm.title || wp?.title?.toString() || parseTitle(md),
    tags: [...(fm.tags || []), ...(wp?.tags || [])],
    date: z
      .date({
        required_error: "`date` is required",
      })
      .parse(fm.date || wp?.date),
    author: z
      .string({
        required_error: "`author` is required",
      })
      .parse(fm.author || wp?.author),
    status: status.default("draft").parse(fm.status || wp?.status),
    _wpId: wp?.id,
  }))
  .transform((post) => ({
    ...post,
    date_string: dateString.parse(post.date),
    disqus: {
      id: `${post._wpId} https://blog.beeminder.com/?p=${post._wpId}`,
      url: `https://blog.beeminder.com/${post.slug}/`,
    },
    _wpId: undefined,
  }));

export type Post = z.infer<typeof post>;
export type PostInput = z.input<typeof post>;
