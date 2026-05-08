import { createHash } from "node:crypto";
import { join } from "node:path";
import { parseMarkdown } from "expost";
import { hashCache } from "./hashCache";

const CACHE_DIR = ".cache/parsed-markdown";

export function cachedParseMarkdown(content: string): string {
  const hash = createHash("md5").update(content).digest("hex");
  return hashCache<string>({
    key: hash,
    path: join(CACHE_DIR, `${hash}.html`),
    serialize: (value) => value,
    deserialize: (raw) => raw,
    compute: () => parseMarkdown(content),
  });
}
