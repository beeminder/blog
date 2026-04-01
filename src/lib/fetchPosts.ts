import fetchPost from "./fetchPost";
import readSources from "./readSources";

async function get(
  post: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  if (typeof post.source !== "string") {
    throw new Error(`Missing url in ${JSON.stringify(post)}`);
  }
  return {
    ...post,
    md: await fetchPost(post.source),
  };
}

export default function fetchPosts(): Promise<Record<string, unknown>>[] {
  return readSources().map((s) => get(s));
}
