import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { parseMarkdown } from "expost";

const CACHE_FILE = ".cache/parsed-markdown.json";

let cache: Record<string, string> = {};

try {
  cache = JSON.parse(readFileSync(CACHE_FILE, "utf-8"));
} catch {
  // No cache file yet
}

let dirty = false;

process.on("exit", () => {
  if (!dirty) return;
  try {
    writeFileSync(CACHE_FILE, JSON.stringify(cache));
  } catch {
    // ignore
  }
});

export function cachedParseMarkdown(content: string): string {
  const hash = createHash("md5").update(content).digest("hex");

  if (hash in cache) {
    return cache[hash];
  }

  const result = parseMarkdown(content);
  cache[hash] = result;
  dirty = true;
  return result;
}
