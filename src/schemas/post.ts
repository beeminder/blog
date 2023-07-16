import { z } from "zod";
import { legacyPostOutput } from "./legacyPostOutput";
import { status } from "./status";
import { frontmatter } from "./frontmatter";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";

export const post = z
  .object({
    wp: legacyPostOutput.optional(),
    source: z.string(),
    md: z.string(),
    fm: frontmatter,
    content: z.string(),
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
    markdown: md,
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
