import { z } from "zod";
import { image } from "./image";
import { status } from "./status";

export const frontmatter = z
  .object({
    title: z.string(),
    excerpt: z.string(),
    image,
    date: z.date(),
    slug: z.string(),
    author: z.string(),
    tags: z.array(z.string()),
    status,
  })
  .partial();

export type Frontmatter = z.infer<typeof frontmatter>;
