import loadLegacyData from "./loadLegacyData";
import { z } from "zod";
import memoize from "./memoize";

const postSchema = z
  .object({
    ID: z.number(),
    Title: z.string(),
    Date: z.coerce.date(),
    Tags: z.preprocess(
      (val) => String(val).split("|").filter(Boolean),
      z.array(z.string())
    ),
    expost_source_url: z.string(),
    dsq_thread_id: z.number(),
    "Author Username": z.string(),
    Slug: z.string(),
    "Comment Status": z.enum(["open", "closed"]),
    "Ping Status": z.enum(["open", "closed"]),
    "Post Modified Date": z.coerce.date(),
    Status: z.enum(["publish", "pending", "draft"]),
  })
  .partial();

const postsSchema = z.array(postSchema);

const getParsedLegacyData = memoize(() => {
  const raw = loadLegacyData();
  return postsSchema.parse(raw);
}, "getParsedLegacyData");

export default function getLegacyData(
  url: string
): z.infer<typeof postSchema> | undefined {
  return getParsedLegacyData().find((p) => p.expost_source_url === url);
}
