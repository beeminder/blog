import { z } from "zod";
import readSources from "./readSources";
import memoize from "./memoize";
import { rawPost } from "../schemas/post";

// A manifest entry is the metadata for one post as it appears in posts.json,
// before its pad body (`md`) has been fetched. It is exactly the validated
// RawPost shape minus that fetched content.
const manifestEntry = rawPost.omit({ md: true });
export type ManifestEntry = z.infer<typeof manifestEntry>;

// Read, validate, and parse posts.json once per build. `readSources` owns the
// raw file I/O; this module owns the manifest's shape and the read-once
// guarantee, handing callers typed entries instead of Record<string, unknown>[]
// they would otherwise have to cast field-by-field.
const getManifest = memoize((): ManifestEntry[] =>
  readSources().map((entry, i) => {
    const result = manifestEntry.safeParse(entry);
    if (!result.success) {
      throw new Error(
        `Invalid manifest entry at index ${i}: ${result.error.message}`,
        { cause: result.error },
      );
    }
    return result.data;
  }),
);

export default getManifest;
