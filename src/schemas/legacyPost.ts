import { z } from "zod";
import readLegacyData from "../lib/readLegacyData";

export const legacyPostInput = z
  .object({
    ID: z.string(),
    Title: z.string(),
    Date: z.string(),
    Tags: z.string(),
    expost_source_url: z.string(),
    dsq_thread_id: z.string(),
    "Author Username": z.string(),
    Slug: z.string(),
    "Comment Status": z.enum(["open", "closed"]),
    "Ping Status": z.enum(["open", "closed"]),
    "Post Modified Date": z.string(),
    Status: z.enum(["publish", "pending", "draft"]),
  })
  .partial();

export const legacyPost = z
  .string()
  .transform((url) => readLegacyData().find((p) => p.expost_source_url === url))
  .transform(legacyPostInput.parse)
  .transform((val) => ({
    id: Number(val.ID),
    title: val.Title,
    date: val.Date ? new Date(val.Date) : undefined,
    tags: val.Tags ? String(val.Tags).split("|").filter(Boolean) : [],
    source: val.expost_source_url,
    disqus_id: Number(val.dsq_thread_id),
    author: val["Author Username"],
    slug: val.Slug,
    commentStatus: val["Comment Status"],
    pingStatus: val["Ping Status"],
    dateModified: val["Post Modified Date"]
      ? new Date(val["Post Modified Date"])
      : undefined,
    status: val.Status,
  }));

export type LegacyPost = z.infer<typeof legacyPost>;
export type LegacyPostInput = z.infer<typeof legacyPostInput>;
