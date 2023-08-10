import { fetchBuilder, FileSystemCache, MemoryCache } from "node-fetch-cache";

const cache = process.env.RENDER ? new MemoryCache() : new FileSystemCache();
const fetch = fetchBuilder.withCache(cache);

export default async function fetchPost(url: string): Promise<string> {
  return fetch(`${url}/export/txt`).then((r) => r.text());
}
