import { z } from "zod";
import { legacyPostOutput } from "./legacyPostOutput";
import { parsedMarkdown } from "./parsedMarkdown";
import { status } from "./status";

export const post = z
  .object({
    wp: legacyPostOutput.optional(),
    markdownUrl: z.string(),
    markdown: z.string(),
    parsed: parsedMarkdown,
  })
  .refine(
    (p) => p.wp !== undefined || p.parsed.frontmatter.excerpt !== undefined,
    {
      message: `Custom excerpts are required for new posts.`,
    }
  )
  .transform(({ wp, markdownUrl, markdown, parsed }) => ({
    ...parsed,
    slug: z.string().parse(parsed.slug || wp?.slug),
    title: parsed.isLegacyTitle
      ? wp?.title?.toString() || parsed.title
      : parsed.title,
    markdown,
    tags: [...parsed.tags, ...(wp?.tags || [])],
    date: z.date().parse(parsed.date || wp?.date),
    url: markdownUrl,
    author: parsed.author || wp?.author || "",
    status: parsed.status ?? status.default("draft").parse(wp?.status),
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
