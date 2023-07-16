import { parse } from "csv-parse/sync";
import { z } from "zod";
import { image, type Image } from "./image";
import { frontmatter } from "./frontmatter";
import parseTitle from "../lib/parseTitle";
import getExcerpt from "../lib/getExcerpt";
import extractImage from "../lib/extractImage";
import { getStatus } from "../lib/makePost";

// function getImage({ image }: Record<string, unknown>): Image | undefined {
//   if (typeof image === "string") {
//     return { src: image, extracted: false };
//   }

//   if (
//     typeof image === "object" &&
//     image !== null &&
//     "src" in image &&
//     typeof image.src === "string"
//   ) {
//     return {
//       ...image,
//       extracted: false,
//     } as Image;
//   }

//   return undefined;
// }

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
    status: getStatus(fm.status),
  }));

export type ParsedMarkdown = z.infer<typeof parsedMarkdown>;
