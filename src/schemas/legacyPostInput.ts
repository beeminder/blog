import { z } from "zod";

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

export type LegacyPostInput = z.infer<typeof legacyPostInput>;
