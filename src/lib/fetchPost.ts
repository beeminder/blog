import NodeFetchCache, { FileSystemCache, MemoryCache } from "node-fetch-cache";
import memoize from "./memoize";
import canonicalizeUrl from "./canonicalizeUrl";
import env from "./env";
import { recordFetch } from "./buildPerf";

const RENDER = env("RENDER");
const FILE_SYSTEM_CACHE = env("FILE_SYSTEM_CACHE");

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

const getFetcher = memoize(() =>
  NodeFetchCache.create({ cache: buildCache() }),
);

export default async function fetchPost(url: string): Promise<string> {
  return getFetcher()(canonicalizeUrl(url)).then((r) => {
    const resp = r as unknown as { fromCache?: boolean };
    const fromCache = !("fromCache" in resp) || resp.fromCache !== false;
    recordFetch(fromCache);
    if (!r.ok) throw new Error(`Failed to fetch ${url}`);
    return r.text();
  });
}
