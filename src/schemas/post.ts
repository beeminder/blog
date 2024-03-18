import { ZodIssueCode, z } from "zod";
import { status } from "./status";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import { image } from "./image";
import extractImage from "../lib/extractImage";
import { body } from "./body";
import { dateString } from "./dateString";

export const post = z
  .object({
    source: z.string(),
    title: z.string().optional(),
    slug: z.string(),
    date: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    status: z.string(),
    disqus_id: z.string(),
    excerpt: z.string(),
    redirects: z.array(z.string()),
    md: z.string(),
  })
  .transform(({ source: url, md, ...rest }, ctx) => {
    const content = md;
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

    const date = rest.date && new Date(rest.date);
    const dateStringResult = dateString.safeParse(date);

    return {
      ...rest,
      tags: rest.tags?.filter(Boolean),
      excerpt: getExcerpt(rest.excerpt, c.data),
      image: extractImage(c.data),
      title: rest.title || parseTitle(md),
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
