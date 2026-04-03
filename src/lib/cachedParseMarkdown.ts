import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseMarkdown } from "expost";

const CACHE_DIR = ".cache/parsed-markdown";

try {
  mkdirSync(CACHE_DIR, { recursive: true });
} catch {
  // ignore
}

export function cachedParseMarkdown(content: string): string {
  const hash = createHash("md5").update(content).digest("hex");
  const cachePath = join(CACHE_DIR, `${hash}.html`);

  try {
    const cached = readFileSync(cachePath, "utf-8");
    if (typeof cached === "string") return cached;
  } catch {
    // Cache miss
  }

  const result = parseMarkdown(content);

  try {
    writeFileSync(cachePath, result);
  } catch {
    // ignore write errors
  }

  return result;
}
