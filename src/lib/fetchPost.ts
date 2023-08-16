import { fetchBuilder, FileSystemCache, MemoryCache } from "node-fetch-cache";

function buildCache() {
  if (import.meta.env.RENDER || import.meta.env.FILE_SYSTEM_CACHE === "false") {
    console.info("Using in-memory cache");
    return new MemoryCache();
  } else {
    console.info("Using file-system cache");
    return new FileSystemCache();
  }
}

const cache = buildCache();
const fetch = fetchBuilder.withCache(cache);

export default async function fetchPost(url: string): Promise<string> {
  return fetch(url).then((r) => r.text());
}
