import type { PostInput } from "../schemas/post";
import canonicalizeUrl from "./canonicalizeUrl";
import fetchPost from "./fetchPost";
import readSources from "./readSources";
import pLimit from "p-limit";

async function get(post: Record<string, unknown>): Promise<PostInput> {
  if (!post.source) throw new Error(`Missing url in ${JSON.stringify(post)}`);

  const url = canonicalizeUrl(post.source.toString());
  return {
    ...(post as PostInput),
    md: await fetchPost(url),
  };
}

export default function fetchPosts(): Promise<PostInput>[] {
  const l = pLimit(10);
  return readSources().map((s) => {
    return l(get, s);
  });
}
