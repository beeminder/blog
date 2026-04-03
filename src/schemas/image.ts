import type { HTMLAttributes } from "astro/types";
import { z } from "zod";

export type Image = {
  src: string;
  extracted?: boolean | undefined;
} & HTMLAttributes<"img">;

// Preserves the inferred input type (needed for .pipe() in Zod v4)
// while still enforcing that the schema output is assignable to Image.
function ensureOutput<T>() {
  return <S extends z.ZodType<T, any>>(s: S): S => s;
}

export const image = ensureOutput<Image>()(
  z
    .object({
      src: z.string(),
      extracted: z.boolean().optional(),
      alt: z.string().optional(),
      title: z.string().optional(),
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
    })
    .transform((img) => ({
      ...img,
      title: img.title || img.alt,
    })),
);
