import { fetchBuilder, FileSystemCache } from "node-fetch-cache";

const fetch = fetchBuilder.withCache(new FileSystemCache());

export default async function fetchPost(url: string): Promise<string> {
  return fetch(`${url}/export/txt`).then((r) => r.text());
}
