import { fetchBuilder, FileSystemCache, MemoryCache } from "node-fetch-cache";
import formatEtherpadUrl from "./formatEtherpadUrl";

const cache =
  import.meta.env.RENDER || import.meta.env.FILE_SYSTEM_CACHE === "false"
    ? new MemoryCache()
    : new FileSystemCache();
const fetch = fetchBuilder.withCache(cache);

export default async function fetchPost(url: string): Promise<string> {
  url = formatEtherpadUrl(url);
  return fetch(`${url}/export/txt`).then((r) => r.text());
}
