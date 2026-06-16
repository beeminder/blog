import getManifest from "./manifest";
import { normalizeTagName, tagRedirectSlug } from "./tagSlug";

export default async function getRedirects(): Promise<Record<string, string>> {
  const sources = getManifest();

  // Build post redirects directly from posts.json (no fetch needed)
  const postRedirects: Record<string, string> = {};
  for (const post of sources) {
    if (post.redirects.length) {
      for (const r of post.redirects) {
        postRedirects[`/${r}`] = `/${post.slug}`;
      }
    }
  }

  // Build tag redirects from posts.json tag arrays (no fetch needed)
  const tagNames = [
    ...new Set(sources.flatMap((p) => p.tags).map(normalizeTagName)),
  ];
  const tagRedirects: Record<string, string> = {};
  for (const tag of tagNames) {
    const encoded = tagRedirectSlug(tag);
    if (encoded) {
      tagRedirects[`/tags/${encoded}`] = `/tags/${tag}`;
    }
    tagRedirects[`/tag/${tag}`] = `/tags/${tag}`;
  }

  const authorRedirects: Record<string, string> = {
    "/authors/dreeves": "/authors/dreev",
  };

  return { ...postRedirects, ...tagRedirects, ...authorRedirects };
}
