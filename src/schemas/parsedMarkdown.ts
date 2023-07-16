import { z } from "zod";
import { image } from "./image";
import { frontmatter } from "./frontmatter";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import extractImage from "../lib/extractImage";
import { status } from "./status";

export const parsedMarkdown = z
  .object({
    fm: frontmatter,
    md: z.string(),
    content: z.string(),
  })
  .transform(({ fm, md, content }) => ({
    title: typeof fm.title === "string" ? fm.title : parseTitle(md),
    isLegacyTitle: typeof fm.title !== "string",
    content,
    excerpt: typeof fm.excerpt === "string" ? fm.excerpt : getExcerpt(content),
    image: image.optional().parse(fm.image || extractImage(content)),
    frontmatter: fm,
    slug: typeof fm.slug === "string" ? fm.slug : undefined,
    date: fm.date instanceof Date ? fm.date : undefined,
    author: typeof fm.author === "string" ? fm.author : undefined,
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    status: status.optional().parse(fm.status),
  }));

export type ParsedMarkdown = z.infer<typeof parsedMarkdown>;
