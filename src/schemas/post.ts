import { ZodIssueCode, z } from "zod";
import { status } from "./status";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";
import matter from "gray-matter";
import { frontmatter } from "./frontmatter";
import { body } from "./body";
import { dateString } from "./dateString";

export const post = z
  .object({
    source: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    date: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
    disqus_id: z.string().optional(),
    excerpt: z.string().optional(),
    redirects: z.array(z.string()).optional(),
    md: z.string(),
  })
  .transform(({ source: url, md, ...rest }, ctx) => {
    const { data, content } = matter(md);
    const meta = {
      ...rest,
      ...frontmatter.parse(data),
    };
    const c = body.safeParse(content);

    if (!c.success) {
      ctx.addIssue({
        path: ["md"],
        message: `Failed to parse post ${url}`,
        code: ZodIssueCode.custom,
        params: {
          error: c.error,
        },
      });
      return z.NEVER;
    }

    const date = meta.date && new Date(meta.date);
    const dateStringResult = dateString.safeParse(date);

    return {
      ...meta,
      tags: meta.tags?.filter(Boolean),
      excerpt: getExcerpt(meta.excerpt, c.data),
      image: extractImage(c.data),
      title: meta.title || parseTitle(md),
      date,
      date_string: dateStringResult.success && dateStringResult.data,
      content: c.data,
      md,
    };
  })
  .pipe(
    z.object({
      content: z.string(),
      excerpt: z.string(),
      slug: z.string().min(1),
      image: image.optional(),
      title: z.string(),
      tags: z.array(z.string()),
      redirects: z.array(z.string()),
      date: z.date(),
      date_string: z.string(),
      author: z.string().min(1),
      status: status,
      disqus_id: z.string().min(1),
      md: z.string(),
    }),
  );

export type Post = z.infer<typeof post>;
export type PostInput = z.input<typeof post>;
