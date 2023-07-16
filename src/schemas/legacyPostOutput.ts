import type { z } from "zod";
import { legacyPostInput } from "./legacyPostInput";

export const legacyPostOutput = legacyPostInput.transform((val) => ({
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

export type LegacyPostOutput = z.infer<typeof legacyPostOutput>;
