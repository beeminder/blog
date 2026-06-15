import fetchPost from "./fetchPost";
import getManifest, { type ManifestEntry } from "./manifest";
import type { RawPost } from "../schemas/post";
import pLimit from "p-limit";

async function get(entry: ManifestEntry): Promise<RawPost> {
  return {
    ...entry,
    md: await fetchPost(entry.source),
  };
}

export default function fetchPosts(): Promise<RawPost>[] {
  const l = pLimit(10);
  return getManifest().map((s) => l(get, s));
}
