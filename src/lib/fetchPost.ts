import { fetchBuilder, FileSystemCache } from "node-fetch-cache";

const fetch = fetchBuilder.withCache(new FileSystemCache());

export default async function fetchPost(url: string): Promise<string> {
  const r = await fetch(`${url}/export/txt`);
  return await r.text();
}
