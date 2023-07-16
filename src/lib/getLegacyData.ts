import readLegacyData from "./readLegacyData";
import { z } from "zod";
import memoize from "./memoize";

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

const getParsedLegacyData = memoize(() => {
  const raw = readLegacyData();
  return z.array(legacyPostInput).parse(raw);
}, "getParsedLegacyData");

export type LegacyPostInput = z.infer<typeof legacyPostInput>;
export type LegacyPostOutput = z.infer<typeof legacyPostOutput>;

export default function getLegacyData(
  url: string
): LegacyPostOutput | undefined {
  const raw = getParsedLegacyData().find((p) => p.expost_source_url === url);
  return raw ? legacyPostOutput.parse(raw) : undefined;
}
