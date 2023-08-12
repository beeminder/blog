import type { PostInput } from "../schemas/post";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import pLimit from "p-limit";

async function get(url: string): Promise<PostInput> {
  return {
    url,
    md: await fetchPost(url),
  };
}

export default async function fetchPosts(): Promise<PostInput[]> {
  const urls = readSources();
  const limit = pLimit(10);

  console.time("Fetching markdown from Etherpad");
  const inputs = await Promise.all(urls.map((url) => limit(get, url)));
  console.timeEnd("Fetching markdown from Etherpad");

  return inputs;
}
