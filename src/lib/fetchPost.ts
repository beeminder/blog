import NodeFetchCache, { FileSystemCache, MemoryCache } from "node-fetch-cache";
import memoize from "./memoize";
import canonicalizeUrl from "./canonicalizeUrl";
import { isPersistentCacheEnabled } from "./cachePolicy";
import { recordFetchAttempt, recordCacheMiss } from "./buildPerf";

function buildCache() {
  if (isPersistentCacheEnabled()) {
    console.info("Using file-system cache");
    return new FileSystemCache();
  } else {
    console.info("Using in-memory cache");
    return new MemoryCache();
  }
}

const getFetcher = memoize(() =>
  NodeFetchCache.create({ cache: buildCache() }),
);

export default async function fetchPost(url: string): Promise<string> {
  recordFetchAttempt();
  return getFetcher()(canonicalizeUrl(url)).then((r) => {
    const resp = r as unknown as { fromCache?: boolean };
    const fromCache = !("fromCache" in resp) || resp.fromCache !== false;
    if (!fromCache) recordCacheMiss();
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.text();
  });
}
