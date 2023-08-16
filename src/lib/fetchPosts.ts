import type { PostInput } from "../schemas/post";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import pLimit from "p-limit";
import canonicalizeUrl from "./canonicalizeUrl";


async function get(url: string): Promise<PostInput> {
  return {
    url,
    md: await fetchPost(url),
  };
}

export default function fetchPosts(): Promise<PostInput>[] {
  const l = pLimit(10);
  return readSources().map((url) => l(get, canonicalizeUrl(url)));
}
