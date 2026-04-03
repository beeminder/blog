import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import memoize from "./memoize";
import { type Post, post } from "../schemas/post";
import fetchPosts from "./fetchPosts";
import readSources from "./readSources";

const POSTS_CACHE_FILE = ".cache/posts-processed.json";

const getDuplicates = (
  arr: Array<Record<string, unknown>>,
  key: string,
): unknown[] => {
  const keys = arr.map((item) => item[key]);
  return keys.filter((key) => keys.indexOf(key) !== keys.lastIndexOf(key));
};

function getSourcesHash(): string {
  const sources = readSources();
  return createHash("md5").update(JSON.stringify(sources)).digest("hex");
}

function tryReadPostsCache(hash: string): Post[] | null {
  try {
    const raw = JSON.parse(readFileSync(POSTS_CACHE_FILE, "utf-8"));
    if (raw.hash !== hash) return null;
    return (raw.posts as Array<Record<string, unknown>>).map((p) => ({
      ...p,
      date: new Date(p.date as string),
    })) as Post[];
  } catch {
    return null;
  }
}

function writePostsCache(hash: string, posts: Post[]): void {
  try {
    writeFileSync(POSTS_CACHE_FILE, JSON.stringify({ hash, posts }));
  } catch {
    // ignore
  }
}

const makePosts = memoize((): Promise<Post>[] =>
  fetchPosts().map((p) =>
    p.then((d) => {
      const result = post.safeParse(d);
      if (result.success) return result.data;
      throw new Error(
        `Failed to parse post ${d.source}: ${result.error.message}`,
        result.error,
      );
    }),
  ),
);

const getAllPosts = memoize(async (): Promise<Post[]> => {
  const hash = getSourcesHash();
  const cached = tryReadPostsCache(hash);
  if (cached) return cached;

  const posts = await Promise.all(makePosts());

  const duplicateSlugs = getDuplicates(posts, "slug");
  if (duplicateSlugs.length > 0) {
    throw new Error(
      `Duplicate slugs found: ${duplicateSlugs.join(
        ", ",
      )}. Slugs must be unique.`,
    );
  }

  const duplicateDisqusIds = getDuplicates(posts, "disqus_id");
  if (duplicateDisqusIds.length > 0) {
    throw new Error(
      `Duplicate disqus_ids found: ${duplicateDisqusIds.join(
        ", ",
      )}. Disqus_ids must be unique.`,
    );
  }

  writePostsCache(hash, posts);
  return posts;
});

const getPosts = memoize(
  async ({
    includeUnpublished = false,
    sort = false,
  }: {
    includeUnpublished?: boolean;
    sort?: boolean;
  } = {}): Promise<Post[]> => {
    const posts = [...(await getAllPosts())];

    if (sort) {
      posts.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    if (includeUnpublished) return posts;

    return posts.filter((p) => p.status === "publish");
  },
);

export default getPosts;
