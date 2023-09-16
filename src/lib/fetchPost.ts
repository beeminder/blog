import { fetchBuilder, FileSystemCache, MemoryCache } from "node-fetch-cache";
import memoize from "./memoize";
import canonicalizeUrl from "./canonicalizeUrl";

function buildCache() {
  if (import.meta.env.RENDER || import.meta.env.FILE_SYSTEM_CACHE === "false") {
    console.info("Using in-memory cache");
    return new MemoryCache();
  } else {
    console.info("Using file-system cache");
    return new FileSystemCache();
  }
}

const getFetcher = memoize(() => fetchBuilder.withCache(buildCache()));

export default async function fetchPost(url: string): Promise<string> {
  return getFetcher()(canonicalizeUrl(url)).then((r) => {
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.text();
  });
}
