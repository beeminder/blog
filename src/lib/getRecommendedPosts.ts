import type { Post } from "../schemas/post";

const RECOMMENDED_COUNT = 6;

type Index = {
  tagIndex: Map<string, Post[]>;
  slugToPost: Map<string, Post>;
};

// Memoize the index per allPosts reference so a `getStaticPaths` loop
// that calls this function once per post pays the indexing cost once,
// not N times.
const indexCache = new WeakMap<readonly Post[], Index>();

function buildIndex(allPosts: Post[]): Index {
  const cached = indexCache.get(allPosts);
  if (cached) return cached;

  const tagIndex = new Map<string, Post[]>();
  for (const p of allPosts) {
    for (const tag of p.tags) {
      const list = tagIndex.get(tag);
      if (list) list.push(p);
      else tagIndex.set(tag, [p]);
    }
  }
  const slugToPost = new Map(allPosts.map((p) => [p.slug, p]));

  const index = { tagIndex, slugToPost };
  indexCache.set(allPosts, index);
  return index;
}

export default function getRecommendedPosts(
  post: Post,
  allPosts: Post[],
): Post[] {
  const { tagIndex, slugToPost } = buildIndex(allPosts);

  const scores = new Map<string, number>();
  for (const tag of post.tags) {
    for (const p of tagIndex.get(tag) ?? []) {
      if (p.slug !== post.slug) {
        scores.set(p.slug, (scores.get(p.slug) ?? 0) + 1);
      }
    }
  }

  return [...scores.entries()]
    .sort(
      (a, b) =>
        b[1] - a[1] ||
        slugToPost.get(b[0])!.date.getTime() -
          slugToPost.get(a[0])!.date.getTime(),
    )
    .slice(0, RECOMMENDED_COUNT)
    .map(([slug]) => slugToPost.get(slug)!);
}
