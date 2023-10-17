import { fetchBuilder, FileSystemCache, MemoryCache } from "node-fetch-cache";
import memoize from "./memoize";
import canonicalizeUrl from "./canonicalizeUrl";

// WORKAROUND: `import.meta.env` is not available during Astro config evaluation.
// https://docs.astro.build/en/guides/configuring-astro/#environment-variables
const RENDER = import.meta.env.RENDER || process.env.RENDER;
const FILE_SYSTEM_CACHE =
  import.meta.env.FILE_SYSTEM_CACHE || process.env.FILE_SYSTEM_CACHE;

const IS_RENDER = !!RENDER;
const IS_FILE_SYSTEM_CACHE_DISABLED = FILE_SYSTEM_CACHE === "false";

function buildCache() {
  if (IS_RENDER || IS_FILE_SYSTEM_CACHE_DISABLED) {
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
