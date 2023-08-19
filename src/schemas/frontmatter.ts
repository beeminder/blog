import { z } from "zod";
import { status } from "./status";

export const frontmatter = z
  .object({
    title: z.string(),
    excerpt: z.string(),
    date: z.date(),
    slug: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    disqusID: z.string(),
    status,
  })
  .partial();

export type Frontmatter = z.infer<typeof frontmatter>;
