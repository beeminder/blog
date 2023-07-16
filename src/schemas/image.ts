import type { HTMLAttributes } from "astro/types";
import { z } from "zod";

export type Image = {
  src: string;
  extracted?: boolean | undefined;
} & HTMLAttributes<"img">;

export const image: z.ZodType<Image> = z.object({
  src: z.string(),
  extracted: z.boolean().optional(),
  alt: z.string().optional(),
  crossorigin: z.enum(["anonymous", "use-credentials"]).optional(),
  decoding: z.enum(["sync", "async", "auto"]).optional(),
  fetchpriority: z.enum(["auto", "high", "low"]).optional(),
  height: z.number().optional(),
  loading: z.enum(["eager", "lazy"]).optional(),
  referrerpolicy: z
    .enum([
      "no-referrer",
      "no-referrer-when-downgrade",
      "origin",
      "origin-when-cross-origin",
      "same-origin",
      "strict-origin",
      "strict-origin-when-cross-origin",
      "unsafe-url",
    ])
    .optional(),
  sizes: z.string().optional(),
  srcset: z.string().optional(),
  usemap: z.string().optional(),
  width: z.number().optional(),
});
